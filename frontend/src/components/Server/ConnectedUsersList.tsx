import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./ConnectedUserList.module.css";
import type { PresenceUser } from "../../features/voice/voiceTypes";
import ConnectedUserItem from "./ConnectedUserItem";
import { useSpeakingDetection } from "../../features/voice/useSpeakingDetection";
import { useVoiceChannel } from "../../features/voice/useVoiceChannel";
import { LOCAL_USER_ID } from "../../features/voice/useWebRTC";

interface ConnectedUsersListProps {
  currentUserId: number;
  users: PresenceUser[];
}

const ConnectedUsersList: React.FC<ConnectedUsersListProps> = ({
  users,
  currentUserId,
}) => {
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [modalPosition, setModalPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement>>({});

  // ── Speaking detection ──────────────────────────────────────────────────
  const { getAnalyserNode, isConnected, isMuted } = useVoiceChannel();
  const [speakingUsers, setSpeakingUsers] = useState<Set<number>>(new Set());

  const handleSpeakingChange = useCallback(
    (userId: number, isSpeaking: boolean) => {
      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        if (isSpeaking) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    },
    [],
  );

  // Monitorear usuarios remotos + LOCAL_USER_ID para el propio usuario
  const monitoredIds = isConnected
    ? [
        ...users.filter((u) => u.id !== currentUserId).map((u) => u.id),
        LOCAL_USER_ID,
      ]
    : [];

  useSpeakingDetection(getAnalyserNode, monitoredIds, handleSpeakingChange);
  // ───────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        const userElement = (event.target as Element).closest(
          `.${styles.userInfo}`,
        );
        if (!userElement) {
          setExpandedUser(null);
          setModalPosition(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (userId: number, key: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setModalPosition(null);
    } else {
      const el = itemRefs.current[key];
      if (el) {
        const rect = el.getBoundingClientRect();
        setModalPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
        });
      }
      setExpandedUser(userId);
    }
  };

  return (
    <div className={styles.connectedUsersList}>
      {users.map((user) => {
        const userKey = `connected-${user.id}`;
        const isSelf = user.id === currentUserId;
        // El usuario local usa LOCAL_USER_ID como clave en el analyser
        const isSpeaking = isSelf
          ? speakingUsers.has(LOCAL_USER_ID) && !isMuted
          : speakingUsers.has(user.id);

        return (
          <ConnectedUserItem
            key={userKey}
            user={user}
            currentUserId={currentUserId}
            isExpanded={expandedUser === user.id}
            modalPosition={expandedUser === user.id ? modalPosition : null}
            itemRef={(el) => {
              if (el) itemRefs.current[userKey] = el;
            }}
            modalRef={modalRef}
            onUserClick={() => handleUserClick(user.id, userKey)}
            isSpeaking={isSpeaking}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ConnectedUsersList);
