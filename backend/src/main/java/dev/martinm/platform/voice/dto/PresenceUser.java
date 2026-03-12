package dev.martinm.platform.voice.dto;

import dev.martinm.platform.users.User;

public record PresenceUser(
        Long id,
        String username,
        String avatarUrl,
        boolean muted
) {
    public PresenceUser(User user, boolean muted) {
        this(user.getId(), user.getUsername(), user.getAvatarUrl(), muted);
    }

    public PresenceUser(User user) {
        this(user, false);
    }
}