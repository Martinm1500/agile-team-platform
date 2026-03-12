import React, { useState } from "react";
import styles from "./FlashcardsDashboard.module.css";
import type { FlashcardDeck } from "./FlashcardsTypes";
import { PlusIcon, SearchIcon } from "../../Icons";
import EditDeckModal from "./EditDeckModal";
import DecksTable from "./DecksTable";
import CreateDeckModal from "./CreateDeckModal";

const FlashcardsDashboard: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>([
    {
      id: 1,
      name: "General Knowledge",
      cards: 15,
      created: "Apr 17, 2024",
    },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<FlashcardDeck | null>(null);
  const [deckName, setDeckName] = useState("");
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null);

  const filterDecks = () => {
    return decks.filter((deck) =>
      deck.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const handleEditDeck = (id: number) => {
    const deck = decks.find((d) => d.id === id);
    if (deck) {
      setDeckToEdit(deck);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = (editedDeck: FlashcardDeck) => {
    setDecks(decks.map((d) => (d.id === editedDeck.id ? editedDeck : d)));
    closeModal();
  };

  const handleDeleteDeck = (id: number) => {
    setDeckToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deckToDelete) {
      setDecks(decks.filter((deck) => deck.id !== deckToDelete));
    }
    setShowDeleteModal(false);
    setDeckToDelete(null);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setShowCreateModal(false);
    setShowEditModal(false);
    setDeckToEdit(null);
    setDeckName("");
  };

  const createDeck = () => {
    if (!deckName.trim()) {
      alert("Deck name cannot be empty.");
      return;
    }
    const newDeck: FlashcardDeck = {
      id: decks.length + 1,
      name: deckName.trim(),
      cards: 0,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setDecks([...decks, newDeck]);
    closeModal();
  };

  const filteredDecks = filterDecks();

  return (
    <div className={styles.flashcardsDashboard}>
      <div className={styles.header}>
        <h1>Flashcards</h1>
      </div>
      <div className={styles.container}>
        <div className={styles.searchDeckContainer}>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon />
            Create Deck
          </button>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <SearchIcon className={styles.searchIcon} />
        </div>
        <DecksTable
          decks={filteredDecks}
          onEdit={handleEditDeck}
          onDelete={handleDeleteDeck}
        />
      </div>
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this deck?</p>
            <button className={styles.deleteButton} onClick={confirmDelete}>
              Yes
            </button>
            <button className={styles.cancelButton} onClick={closeModal}>
              No
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateDeckModal
          deckName={deckName}
          setDeckName={setDeckName}
          onCreate={createDeck}
          onClose={closeModal}
        />
      )}

      {showEditModal && deckToEdit && (
        <EditDeckModal
          deck={deckToEdit}
          onSave={handleSaveEdit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default FlashcardsDashboard;
