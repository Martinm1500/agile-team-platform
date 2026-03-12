package dev.martinm.platform.voice;

import dev.martinm.platform.voice.dto.StaleUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@Slf4j
public class UserChannelStateManager {
    private final ConcurrentHashMap<Long, UserChannelState> userChannelStates = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, AtomicBoolean> processingUsers = new ConcurrentHashMap<>();

    public boolean tryMarkProcessing(Long userId) {
        return processingUsers
                .computeIfAbsent(userId, k -> new AtomicBoolean(false))
                .compareAndSet(false, true);
    }

    public void unmarkProcessing(Long userId) {
        AtomicBoolean flag = processingUsers.get(userId);
        if (flag != null) {
            flag.set(false);
        }
    }

    public Mono<Long> getUserChannel(Long userId) {
        return Mono.fromCallable(() -> {
                    UserChannelState state = userChannelStates.get(userId);
                    return state != null ? state.channelId() : null;
                })
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> Mono.just(null));
    }

    public Long getUserChannelSync(Long userId) {
        UserChannelState state = userChannelStates.get(userId);
        return state != null ? state.channelId() : null;
    }

    public Long getUserServerSync(Long userId) {
        UserChannelState state = userChannelStates.get(userId);
        return state != null ? state.serverId() : null;
    }

    public UserChannelState getUserChannelState(Long userId) {
        return userChannelStates.get(userId);
    }

    public Mono<Boolean> tryUpdateUserChannel(Long userId,
                                              Long expectedOldChannel,
                                              Long newChannelId,
                                              Long newServerId) {
        return Mono.fromCallable(() -> {
            AtomicBoolean success = new AtomicBoolean(false);

            if (newChannelId == null) {
                userChannelStates.computeIfPresent(userId, (key, currentState) -> {
                    if (Objects.equals(currentState.channelId(), expectedOldChannel)) {
                        success.set(true);
                        return null;
                    }
                    return currentState;
                });
            } else {
                userChannelStates.compute(userId, (key, currentState) -> {
                    Long currentChannel = currentState != null ? currentState.channelId() : null;
                    if (Objects.equals(currentChannel, expectedOldChannel)) {
                        success.set(true);
                        return new UserChannelState(newChannelId, newServerId);
                    }
                    return currentState;
                });
            }

            return success.get();
        }).onErrorResume(e -> Mono.just(false));
    }

    public Mono<Void> validateUserInChannel(Long userId, Long channelId) {
        return Mono.fromCallable(() -> {
                    UserChannelState state = userChannelStates.get(userId);
                    if (state == null || !Objects.equals(state.channelId(), channelId)) {
                        throw new IllegalStateException("User not in channel");
                    }
                    return null;
                })
                .timeout(Duration.ofSeconds(5))
                .then();
    }

    public void updateHeartbeat(Long userId) {
        userChannelStates.computeIfPresent(userId, (key, currentState) ->
                currentState.updateHeartbeat()
        );
    }

    public List<StaleUserInfo> findStaleUsers(long heartbeatTimeout) {
        long timeout = heartbeatTimeout * 3;
        List<StaleUserInfo> staleUsers = new ArrayList<>();

        userChannelStates.forEach((userId, state) -> {
            if (state.isStale(timeout) && state.channelId() != null) {
                staleUsers.add(new StaleUserInfo(userId, state.channelId()));
            }
        });

        return staleUsers;
    }

    public void removeUserState(Long userId) {
        UserChannelState removed = userChannelStates.remove(userId);
        if (removed != null) {
            log.debug("Removed user state for user {} (was in channel {} / server {} / v{})",
                    userId, removed.channelId(), removed.serverId(), removed.version());
        }
    }

    public int cleanupOrphanedStates(ActorManager actorManager) {
        if (userChannelStates.isEmpty()) {
            return 0;
        }

        List<Long> orphanedUsers = new ArrayList<>();

        userChannelStates.forEach((userId, state) -> {
            Long channelId = state.channelId();
            if (channelId != null && !actorManager.hasActor(channelId)) {
                orphanedUsers.add(userId);
            }
        });

        if (!orphanedUsers.isEmpty()) {
            log.warn("Found {} orphaned user states (referencing non-existent channels)",
                    orphanedUsers.size());
            for (Long userId : orphanedUsers) {
                UserChannelState removed = userChannelStates.remove(userId);
                if (removed != null) {
                    log.info("Cleaned orphaned state for user {} (channel {} / server {} / v{})",
                            userId, removed.channelId(), removed.serverId(), removed.version());
                }
            }
        }

        return orphanedUsers.size();
    }

    public boolean isEmpty() {
        return userChannelStates.isEmpty();
    }

    public int getUserStateCount() {
        return userChannelStates.size();
    }

    public void clear() {
        int size = userChannelStates.size();
        userChannelStates.clear();
        if (size > 0) {
            log.info("Cleared {} user channel states", size);
        }
    }

    public UserStateStats getStats(long heartbeatTimeout) {
        int total = userChannelStates.size();
        int stale = 0;
        int withoutChannel = 0;

        for (UserChannelState state : userChannelStates.values()) {
            if (state.channelId() == null) withoutChannel++;
            if (state.isStale(heartbeatTimeout * 3)) stale++;
        }

        return new UserStateStats(total, stale, withoutChannel);
    }

    public record UserStateStats(int total, int stale, int withoutChannel) {}
}