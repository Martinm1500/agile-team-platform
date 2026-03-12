import React, { useState, useCallback } from "react";
import styles from "./AddContactModal.module.css";

interface AddContactModalProps {
  onClose: () => void;
  onSubmit: (username: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [username, setUsername] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (username.trim()) {
        onSubmit(username.trim());
      }
    },
    [username, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && username.trim()) {
        handleSubmit(e);
      }
    },
    [username, handleSubmit]
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 className={styles.title} id="modal-title">
          Add contact
        </h2>
        <p className={styles.subtitle}>
          Add a user and star a new conversation
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="@username"
              required
              autoFocus
              disabled={isLoading}
              className={styles.input}
              autoComplete="off"
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? "Adding..." : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
