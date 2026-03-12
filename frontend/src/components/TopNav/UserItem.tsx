import React, { useEffect, useRef, useState } from "react";
import styles from "./UserItem.module.css";
import { MicrophoneIcon, MutedMicrophoneIcon, VolumeIcon } from "../Icons";
import type { PresenceUser } from "../../features/voice/voiceTypes";
import { useVoiceChannel } from "../../features/voice/useVoiceChannel";

type UserItemProps = {
  currentUserId: number;
  user: PresenceUser;
};

const UserItem: React.FC<UserItemProps> = ({ user, currentUserId }) => {
  const { isMuted, setMute, setUserVolume } = useVoiceChannel();

  const [showOptions, setShowOptions] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [localVolume, setLocalVolume] = useState(1);
  const userItemRef = useRef<HTMLDivElement>(null);
  const optionsPanelRef = useRef<HTMLDivElement>(null);

  const isSelf = user.id === currentUserId;
  // For self: use local isMuted state. For others: use presence muted field (server-authoritative).
  const effectiveMuted = isSelf ? isMuted : user.muted;

  const handleItemClick = () => {
    if (showOptions) {
      setShowOptions(false);
      setPanelPosition(null);
    } else {
      const rect = userItemRef.current?.getBoundingClientRect();
      if (rect) {
        let left: number;
        const panelWidth = 200;
        if (window.innerWidth <= 768) {
          left = rect.right - panelWidth;
        } else {
          left = rect.left + rect.width / 2 - panelWidth / 2;
        }
        if (left < 0) left = 0;
        if (left + panelWidth > window.innerWidth)
          left = window.innerWidth - panelWidth;
        setPanelPosition({ top: rect.bottom, left });
        setShowOptions(true);
      }
    }
  };

  useEffect(() => {
    if (showOptions) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          userItemRef.current &&
          !userItemRef.current.contains(event.target as Node) &&
          optionsPanelRef.current &&
          !optionsPanelRef.current.contains(event.target as Node)
        ) {
          setShowOptions(false);
          setPanelPosition(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showOptions]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value) / 100;
    setLocalVolume(volume);
    setUserVolume(user.id, volume);
  };

  const handleMuteToggle = () => {
    if (isSelf) {
      setMute(!isMuted);
    }
  };

  const micIcon = effectiveMuted ? (
    <MutedMicrophoneIcon className={styles.micStatus} />
  ) : (
    <MicrophoneIcon className={styles.micStatus} />
  );

  const defaultAvatar = "/default-avatar.png";

  return (
    <>
      <div
        className={`${styles.userItem} ${showOptions ? styles.expanded : ""}`}
        ref={userItemRef}
        role="button"
        tabIndex={0}
        aria-label={`View profile of ${user.username}`}
        onClick={handleItemClick}
      >
        <div className={styles.userAvatar}>
          <img
            src={user.avatarUrl ?? defaultAvatar}
            alt={user.username}
            loading="lazy"
          />
          {micIcon}
        </div>
      </div>

      {showOptions && panelPosition && (
        <div
          className={styles.volumeControls}
          ref={optionsPanelRef}
          style={{
            top: `${panelPosition.top}px`,
            left: `${panelPosition.left}px`,
          }}
        >
          {isSelf && (
            <div className={styles.controlRow}>
              <button
                className={styles.controlButton}
                onClick={handleMuteToggle}
                title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
              >
                {isMuted ? (
                  <MutedMicrophoneIcon className={styles.controlIcon} />
                ) : (
                  <MicrophoneIcon className={styles.controlIcon} />
                )}
                <span>
                  {isMuted ? "Activar micrófono" : "Silenciar micrófono"}
                </span>
              </button>
            </div>
          )}

          {!isSelf && (
            <div className={styles.controlRow}>
              <VolumeIcon className={styles.volumeIcon} />
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(localVolume * 100)}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                aria-label="Adjust volume"
              />
              <span className={styles.volumeValue}>
                {Math.round(localVolume * 100)
                  .toString()
                  .padStart(3, " ")}
                %
              </span>
            </div>
          )}
        </div>
      )}
      {showOptions && <div className={styles.backdrop} />}
    </>
  );
};

export default UserItem;
