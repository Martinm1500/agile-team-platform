import React, { useState } from "react";
import styles from "./Modal.module.css";
import type { FlashcardDeck } from "./FlashcardsTypes";

interface EditDeckModalProps {
  deck: FlashcardDeck;
  onSave: (deck: FlashcardDeck) => void;
  onClose: () => void;
}

const EditDeckModal: React.FC<EditDeckModalProps> = ({
  deck,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(deck.name);
  const [cards, setCards] = useState(deck.cards);

  const handleSave = () => {
    onSave({ ...deck, name, cards: Number(cards) });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Deck</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name"
          className={styles.deckNameInput}
        />
        <input
          type="number"
          value={cards}
          onChange={(e) => setCards(Number(e.target.value))}
          placeholder="Enter number of cards"
          className={styles.deckCardsInput}
          min="0"
        />
        <div className={styles.modalButtons}>
          <button className={styles.createButton} onClick={handleSave}>
            Save
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeckModal;
