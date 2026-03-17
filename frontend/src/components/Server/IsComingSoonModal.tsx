import React from "react";
import styles from "./IsComingSoonModal.module.css";

interface IsComingSoonProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const IsComingSoonModal: React.FC<IsComingSoonProps> = ({
  isOpen,
  onClose,
  title = "Coming Soon",
  message = "This functionality will be available next month.",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.comingSoonModal}>
        <h2 className={styles.comingSoonModalTitle}>{title}</h2>
        <p className={styles.comingSoonModalMessage}>{message}</p>
        <div className={styles.comingSoonModalActions}>
          <button className={styles.comingSoonModalButton} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default IsComingSoonModal;
