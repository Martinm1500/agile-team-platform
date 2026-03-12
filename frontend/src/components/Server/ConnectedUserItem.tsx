import React from "react";
import { MicrophoneIcon, MutedMicrophoneIcon, VolumeIcon } from "../Icons";
import styles from "./ConnectedUserList.module.css";
import type { PresenceUser } from "../../features/voice/voiceTypes";
import { useVoiceChannel } from "../../features/voice/useVoiceChannel";
import { useSelector } from "react-redux";
import { selectUserVolume } from "../../features/voice/voiceSlice";

const defaultAvatar = "/default-avatar.png";

interface ConnectedUserItemProps {
  user: PresenceUser;
  currentUserId: number;
  isExpanded: boolean;
  modalPosition: { top: number; left: number } | null;
  itemRef: (el: HTMLDivElement | null) => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
  onUserClick: () => void;
  isSpeaking: boolean;
}

const ConnectedUserItem: React.FC<ConnectedUserItemProps> = ({
  user,
  currentUserId,
  isExpanded,
  modalPosition,
  itemRef,
  modalRef,
  onUserClick,
  isSpeaking,
}) => {
  const { isMuted, setMute, setUserVolume } = useVoiceChannel();
  const volume = useSelector(selectUserVolume(user.id));
  const isSelf = user.id === currentUserId;
  const effectiveMuted = isSelf ? isMuted : user.muted;

  const micIcon = effectiveMuted ? (
    <MutedMicrophoneIcon
      className={`${styles.userMicStatus} ${styles.muted}`}
    />
  ) : (
    <MicrophoneIcon className={styles.userMicStatus} />
  );

  return (
    <>
      <div
        className={`${styles.connectedUserItem} ${isExpanded ? styles.expanded : ""}`}
        ref={itemRef}
      >
        <div className={styles.userInfo} onClick={onUserClick}>
          <div
            className={`${styles.avatarWrapper} ${isSpeaking ? styles.speaking : ""}`}
          >
            <img
              src={user.avatarUrl ?? defaultAvatar}
              alt={user.username}
              className={styles.userAvatar}
            />
          </div>
          <span className={styles.userName}>{user.username}</span>
        </div>
        {micIcon}
        {isExpanded && modalPosition && (
          <div
            ref={modalRef}
            className={styles.volumeControls}
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
            }}
          >
            <div className={styles.controlRow}>
              {isSelf ? (
                <button
                  className={styles.controlButton}
                  onClick={() => setMute(!isMuted)}
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
              ) : (
                <div className={styles.controlRow}>
                  <VolumeIcon className={styles.volumeIcon} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(volume * 100)}
                    onChange={(e) =>
                      setUserVolume(user.id, parseFloat(e.target.value) / 100)
                    }
                    className={styles.volumeSlider}
                  />
                  <span className={styles.volumeValue}>
                    {Math.round(volume * 100)
                      .toString()
                      .padStart(3, " ")}
                    %
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isExpanded && <div className={styles.backdrop} />}
    </>
  );
};

export default ConnectedUserItem;
