import React, { useState } from "react";
import { VolumeUpIcon, HashtagIcon } from "../Icons";
import styles from "./CreateChannelModal.module.css";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, type: "TEXT" | "VOICE") => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
}) => {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"TEXT" | "VOICE">("TEXT");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelName.trim()) {
      onCreateChannel(channelName.trim(), channelType);
      setChannelName("");
    }
  };

  const handleClose = () => {
    setChannelName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.createChannelModal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.createChannelModalTitle}>
          Create New {channelType === "TEXT" ? "TEXT" : "VOICE"} Channel
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.createChannelModalInputGroup}>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Channel name"
              className={styles.createChannelModalInput}
              autoFocus
            />
          </div>

          <div className={styles.createChannelModalTypeSelector}>
            <label className={styles.createChannelModalTypeOption}>
              <input
                type="radio"
                value="text"
                checked={channelType === "TEXT"}
                onChange={() => setChannelType("TEXT")}
              />
              <HashtagIcon />
              <span>Text Channel</span>
            </label>
            <label className={styles.createChannelModalTypeOption}>
              <input
                type="radio"
                value="voice"
                checked={channelType === "VOICE"}
                onChange={() => setChannelType("VOICE")}
              />
              <VolumeUpIcon />
              <span>Voice Channel</span>
            </label>
          </div>

          <div className={styles.createChannelModalActions}>
            <button
              type="button"
              className={`${styles.createChannelModalButton} ${styles.createChannelModalButtonCancel}`}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.createChannelModalButton} ${styles.createChannelModalButtonCreate}`}
              disabled={!channelName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
