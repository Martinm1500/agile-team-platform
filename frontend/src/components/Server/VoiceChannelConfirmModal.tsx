import React from "react";
import styles from "./VoiceChannelConfirmModal.module.css";
import { VolumeUpIcon } from "../Icons";

interface VoiceChannelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentChannelName: string;
  newChannelName: string;
}

const VoiceChannelConfirmModal: React.FC<VoiceChannelConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentChannelName,
  newChannelName,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cambiar de canal de voz</h2>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>
            ¿Estás seguro de que quieres cambiar de canal?
          </p>

          <div className={styles.channelComparison}>
            <div className={styles.channelItem}>
              <div className={styles.channelLabel}>Canal actual:</div>
              <div className={styles.channelName}>
                <VolumeUpIcon className={styles.channelIcon} />
                <span>{currentChannelName}</span>
              </div>
            </div>

            <div className={styles.arrowIcon}>→</div>

            <div className={styles.channelItem}>
              <div className={styles.channelLabel}>Nuevo canal:</div>
              <div className={styles.channelName}>
                <VolumeUpIcon className={styles.channelIcon} />
                <span>{newChannelName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelConfirmModal;
