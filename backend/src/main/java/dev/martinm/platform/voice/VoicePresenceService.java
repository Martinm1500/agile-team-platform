package dev.martinm.platform.voice;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import dev.martinm.platform.users.User;
import dev.martinm.platform.users.repository.UserRepository;
import dev.martinm.platform.voice.dto.PresenceUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@Slf4j
@RequiredArgsConstructor
public class VoicePresenceService {

    private final VoiceMessagingService messagingService;
    private final UserRepository userRepository;

    private final ConcurrentHashMap<Long, ConcurrentHashMap<Long, ConcurrentHashMap.KeySetView<Long, Boolean>>> serverPresence =
            new ConcurrentHashMap<>();

    private final ConcurrentHashMap<Long, Boolean> userMuteState = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<Long, AtomicBoolean> broadcastInFlight = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, AtomicBoolean> dirty = new ConcurrentHashMap<>();

    private final Cache<Long, User> userCache = Caffeine.newBuilder()
            .expireAfterWrite(60, TimeUnit.SECONDS)
            .expireAfterAccess(5, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    // ==================== Mutations ====================

    public void userJoinedChannel(Long serverId, Long channelId, Long userId) {
        if (serverId == null || channelId == null || userId == null) {
            log.warn("userJoinedChannel called with null argument: serverId={}, channelId={}, userId={}",
                    serverId, channelId, userId);
            return;
        }

        serverPresence
                .computeIfAbsent(serverId, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(channelId, k -> ConcurrentHashMap.newKeySet())
                .add(userId);

        userMuteState.put(userId, false);

        log.debug("Presence add: user {} joined channel {} in server {}", userId, channelId, serverId);
        scheduleBroadcast(serverId);
    }

    public void userLeftChannel(Long serverId, Long channelId, Long userId) {
        if (serverId == null || channelId == null || userId == null) {
            log.warn("userLeftChannel called with null argument: serverId={}, channelId={}, userId={}",
                    serverId, channelId, userId);
            return;
        }

        ConcurrentHashMap<Long, ConcurrentHashMap.KeySetView<Long, Boolean>> channels =
                serverPresence.get(serverId);
        if (channels != null) {
            channels.computeIfPresent(channelId, (cid, users) -> {
                users.remove(userId);
                return users.isEmpty() ? null : users;
            });

            serverPresence.computeIfPresent(serverId, (sid, chs) ->
                    chs.isEmpty() ? null : chs
            );
        }

        userMuteState.remove(userId);

        log.debug("Presence remove: user {} left channel {} in server {}", userId, channelId, serverId);
        scheduleBroadcast(serverId);
    }

    public void usersRemovedFromChannel(Long channelId, List<Long> userIds) {
        if (channelId == null || userIds == null || userIds.isEmpty()) return;

        Set<Long> toRemove = new HashSet<>(userIds);
        Set<Long> affectedServers = ConcurrentHashMap.newKeySet();

        serverPresence.forEach((serverId, channels) -> {
            channels.computeIfPresent(channelId, (cid, users) -> {
                boolean changed = users.removeAll(toRemove);
                if (changed) {
                    affectedServers.add(serverId);
                    log.debug("Presence bulk remove: {} users from channel {} in server {}",
                            userIds.size(), channelId, serverId);
                }
                return users.isEmpty() ? null : users;
            });

            serverPresence.computeIfPresent(serverId, (sid, chs) ->
                    chs.isEmpty() ? null : chs
            );
        });

        toRemove.forEach(userMuteState::remove);

        affectedServers.forEach(this::scheduleBroadcast);
    }

    public void updateMuteState(Long userId, boolean muted) {
        if (userId == null) return;
        userMuteState.put(userId, muted);
    }

    // ==================== Queries ====================

    public Map<Long, List<PresenceUser>> getServerPresence(Long serverId) {
        ConcurrentHashMap<Long, ConcurrentHashMap.KeySetView<Long, Boolean>> channels =
                serverPresence.get(serverId);

        if (channels == null || channels.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, Set<Long>> snapshot = new HashMap<>();
        Set<Long> allUserIds = new HashSet<>();

        channels.forEach((channelId, users) -> {
            Set<Long> copy = new HashSet<>(users);
            if (!copy.isEmpty()) {
                snapshot.put(channelId, copy);
                allUserIds.addAll(copy);
            }
        });

        if (allUserIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, User> userMap = resolveUsers(allUserIds);

        Map<Long, List<PresenceUser>> result = new HashMap<>();
        snapshot.forEach((channelId, userIds) -> {
            List<PresenceUser> users = userIds.stream()
                    .map(userMap::get)
                    .filter(Objects::nonNull)
                    .map(user -> new PresenceUser(user, userMuteState.getOrDefault(user.getId(), false)))
                    .toList();
            if (!users.isEmpty()) {
                result.put(channelId, users);
            }
        });

        return Collections.unmodifiableMap(result);
    }

    private Map<Long, User> resolveUsers(Set<Long> userIds) {
        Map<Long, User> result = new HashMap<>();
        Set<Long> missing = new HashSet<>();

        for (Long userId : userIds) {
            User cached = userCache.getIfPresent(userId);
            if (cached != null) {
                result.put(userId, cached);
            } else {
                missing.add(userId);
            }
        }

        if (missing.isEmpty()) {
            return result;
        }

        try {
            userRepository.findAllById(missing).forEach(user -> {
                userCache.asMap().putIfAbsent(user.getId(), user);
                result.put(user.getId(), user);
            });
        } catch (Exception e) {
            log.error("Error loading {} users from DB for presence resolution", missing.size(), e);
        }

        return result;
    }

    // ==================== Broadcast ====================

    private void scheduleBroadcast(Long serverId) {
        AtomicBoolean inFlight  = broadcastInFlight.computeIfAbsent(serverId, k -> new AtomicBoolean(false));
        AtomicBoolean dirtyFlag = dirty.computeIfAbsent(serverId, k -> new AtomicBoolean(false));

        if (!inFlight.compareAndSet(false, true)) {
            dirtyFlag.set(true);
            return;
        }

        dirtyFlag.set(false);

        Mono.fromCallable(() -> getServerPresence(serverId))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(presence -> messagingService.broadcastRaw(
                        "/topic/server/" + serverId + "/voice-presence", presence))
                .doFinally(signal -> {
                    inFlight.set(false);

                    if (dirtyFlag.compareAndSet(true, false)) {
                        scheduleBroadcast(serverId);
                    } else {
                        tryCleanupServerMaps(serverId);
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error broadcasting presence for server {}", serverId, e);
                    return Mono.empty();
                })
                .subscribe();
    }

    private void tryCleanupServerMaps(Long serverId) {
        if (serverPresence.containsKey(serverId)) {
            return;
        }

        AtomicBoolean inFlight = broadcastInFlight.get(serverId);
        if (inFlight != null && !inFlight.get()) {
            broadcastInFlight.remove(serverId);
            dirty.remove(serverId);
            log.debug("Cleaned up broadcast maps for empty server {}", serverId);
        }
    }

    // ==================== Lifecycle ====================

    public void clear() {
        serverPresence.clear();
        broadcastInFlight.clear();
        dirty.clear();
        userMuteState.clear();
        userCache.invalidateAll();
    }

    public PresenceStats getStats() {
        int totalServers = serverPresence.size();
        int totalChannels = serverPresence.values().stream()
                .mapToInt(ConcurrentHashMap::size).sum();
        int totalUsers = serverPresence.values().stream()
                .flatMap(m -> m.values().stream())
                .mapToInt(Set::size).sum();
        return new PresenceStats(totalServers, totalChannels, totalUsers,
                userCache.estimatedSize());
    }

    public record PresenceStats(int servers, int channels, int users, long cachedUsers) {}
}