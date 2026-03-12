import React, { useEffect, useRef, useState } from "react";
import styles from "./NoteCard.module.css";
import type { DisplayNote, Note, IndicatorNote } from "./SmartNotesTypes";

interface NoteCardProps {
  note: DisplayNote;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, noteId: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, noteId: number) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, noteId: number) => void;
  onClick: (note: DisplayNote) => void;
  onToggleMenu: (noteId: number, e?: React.MouseEvent) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: number) => void;
  isMenuOpen: boolean;
  isDragOver: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onToggleMenu,
  onEditNote,
  onDeleteNote,
  isMenuOpen,
  isDragOver,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const noteCardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(event.target as Node)
      ) {
        onToggleMenu(note.id);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, note.id, onToggleMenu]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!noteCardRef.current) return;

    setIsDragging(true);

    // Create a custom drag image that only shows the visible part
    const rect = noteCardRef.current.getBoundingClientRect();
    const clone = noteCardRef.current.cloneNode(true) as HTMLElement;

    // Style the clone to look like during dragging
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.opacity = "0.8";
    clone.style.zIndex = "10000";
    clone.style.pointerEvents = "none";
    clone.classList.add(styles.draggingPreview);

    document.body.appendChild(clone);

    // Use the clone as drag image
    e.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);

    // Clean up the clone after a short time
    setTimeout(() => {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }, 100);

    // Call the original handler
    if ("type" in note && note.type !== "empty" && note.type !== "indicator") {
      onDragStart(e, note.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  if ("type" in note && note.type === "empty") {
    return (
      <div
        className={`${styles.noteCard} ${styles.empty} ${
          isDragOver ? styles.dragOver : ""
        }`}
        onDragOver={(e) => onDragOver(e, note.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, note.id)}
        onClick={() => onClick(note)}
      ></div>
    );
  }

  if ("type" in note && note.type === "indicator") {
    const indicatorNote = note as IndicatorNote;
    return (
      <div
        className={`${styles.noteCard} ${styles.indicator} ${
          isDragOver ? styles.dragOver : ""
        }`}
        onDragOver={(e) => onDragOver(e, indicatorNote.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, indicatorNote.id)}
        onClick={() => onClick(indicatorNote)}
      >
        <div className={styles.indicatorContent}>
          <div className={styles.indicatorIcon}>+</div>
          <div className={styles.indicatorText}>
            Click to create your first note or on any empty square to add more
            notes
          </div>
        </div>
      </div>
    );
  }

  const realNote = note as Note;

  return (
    <div
      ref={noteCardRef}
      className={`${styles.noteCard} ${isDragOver ? styles.dragOver : ""} ${
        isDragging ? styles.dragging : ""
      } ${styles[realNote.type.toLowerCase().replace(" ", "-")]}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => onDragOver(e, realNote.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, realNote.id)}
      onClick={() => onClick(realNote)}
    >
      <div className={styles.noteCardHeader}>
        <span className={styles.title}>{realNote.title}</span>
        <div className={styles.noteMenu}>
          <button
            ref={menuBtnRef}
            className={styles.menuBtn}
            onClick={(e) => onToggleMenu(realNote.id, e)}
          >
            ⋮
          </button>
          {isMenuOpen && (
            <div className={styles.menuDropdown} ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNote(realNote);
                }}
              >
                Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(realNote.id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p>{realNote.content}</p>
      {realNote.tags.length > 0 && (
        <div className={styles.tags}>
          {realNote.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
          {realNote.tags.length > 3 && (
            <span className={styles.tag}>+{realNote.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
