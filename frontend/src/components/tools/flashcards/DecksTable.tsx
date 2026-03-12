import React from "react";
import styles from "./DesksTable.module.css";
import type { FlashcardDeck } from "./FlashcardsTypes";
import { EditIcon } from "../../Icons";

interface DecksTableProps {
  decks: FlashcardDeck[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DecksTable: React.FC<DecksTableProps> = ({ decks, onEdit, onDelete }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Cards</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {decks.map((deck) => (
          <tr key={deck.id}>
            <td>{deck.name}</td>
            <td>{deck.cards}</td>
            <td>{deck.created}</td>
            <td className={styles.deckActions}>
              <button
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={() => onEdit(deck.id)}
              >
                <EditIcon />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete(deck.id)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6l-2 14H7L5 6m6 0V4a2 2 0 1 1 4 0v2" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DecksTable;
