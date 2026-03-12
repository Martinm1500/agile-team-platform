import React from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  return (
    <div className={styles.confirmModalOverlay}>
      <div className={styles.confirmModalContent}>
        <h3 className={styles.confirmModalTitle}>{title}</h3>
        <p className={styles.confirmModalText}>{message}</p>
        <div className={styles.confirmModalButtons}>
          <button
            onClick={onCancel}
            className={`${styles.modalButton} ${styles.cancelButton}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.modalButton} ${styles.createButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
