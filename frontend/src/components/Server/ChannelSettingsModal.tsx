import React, { useState, useEffect } from "react";
import { HashtagIcon, VolumeUpIcon } from "../Icons";
import styles from "./ChannelSettingsModal.module.css";
import type { Channel } from "../../features/servers/serverTypes";

interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channelId: number, name: string) => void;
  onDelete: (channelId: number) => void;
  channel: Channel | null;
  canManageChannels: boolean;
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  channel,
  canManageChannels,
}) => {
  const [name, setName] = useState(channel?.name || "");

  useEffect(() => {
    if (channel) {
      setName(channel.name || "");
    }
  }, [channel]);

  if (!isOpen || !channel) return null;

  const isVoiceChannel = channel.type === "VOICE";
  const channelId = channel.id;
  const isValidName = name.trim().length > 0;
  const hasProjectId = channel.projectId != null;

  const handleSave = () => {
    if (!isValidName || !canManageChannels) return;
    onSave(channelId, name.trim());
    onClose();
  };

  const handleDelete = () => {
    if (!canManageChannels) return;
    onDelete(channelId);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {isVoiceChannel ? <VolumeUpIcon /> : <HashtagIcon />}
          Edit {isVoiceChannel ? "Voice" : "Text"} Channel: {channel.name}
        </h2>
        <div className={styles.inputGroup}>
          <label className={styles.sectionTitle}>Channel Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter channel name"
            disabled={!canManageChannels}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonCancel} onClick={onClose}>
            Cancel
          </button>
          {canManageChannels && (
            <>
              <button
                className={styles.buttonSave}
                onClick={handleSave}
                disabled={!isValidName}
              >
                Save
              </button>
              {!hasProjectId && (
                <button className={styles.buttonDelete} onClick={handleDelete}>
                  Delete channel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;
