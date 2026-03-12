import React from "react";
import styles from "./Modal.module.css";

interface CreateDeckModalProps {
  deckName: string;
  setDeckName: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  deckName,
  setDeckName,
  onCreate,
  onClose,
}) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Create New Deck</h2>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Enter deck name"
          className={styles.deckNameInput}
        />
        <div className={styles.modalButtons}>
          <button className={styles.createButton} onClick={onCreate}>
            Create
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDeckModal;
