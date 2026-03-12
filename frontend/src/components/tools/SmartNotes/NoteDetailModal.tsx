import React, { useRef, useEffect } from "react";
import styles from "./NoteDetailModal.module.css";
import { CalendarIcon } from "../../Icons";
import type { Note } from "./SmartNotesTypes";

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const getAvatarUrl = (name: string) => {
    const seed = name.replace(/\s+/g, "").toLowerCase();
    return `https://i.pravatar.cc/150?u=${seed}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.noteDetailContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{note.title}</h2>
          <span
            className={`${styles.category} ${
              styles[note.type.toLowerCase().replace(" ", "-")]
            }`}
          >
            {note.type.charAt(0).toUpperCase() +
              note.type.slice(1).replace("-", " ")}
          </span>
        </div>
        {note.summary && (
          <div className={styles.noteDetailSection}>
            <h3 className={styles.sectionLabel}>Summary</h3>
            <p className={styles.sectionText}>{note.summary}</p>
          </div>
        )}
        <div className={styles.noteDetailSection}>
          <h3 className={styles.sectionLabel}>Content</h3>
          <p className={styles.sectionText}>{note.content}</p>
        </div>
        {note.tags.length > 0 && (
          <div className={styles.noteDetailSection}>
            <h3 className={styles.sectionLabel}>Tags</h3>
            <div className={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {note.sourceLinks.length > 0 && (
          <div className={styles.noteDetailSection}>
            <h3 className={styles.sectionLabel}>Source Links</h3>
            <div className={styles.sourceLinksContainer}>
              {note.sourceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
        {note.insights.length > 0 && (
          <div className={styles.noteDetailSection}>
            <h3 className={styles.sectionLabel}>Insights</h3>
            <div className={styles.insightsContainer}>
              {note.insights.map((insight, index) => (
                <span key={index} className={styles.insightItem}>
                  {insight}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className={styles.noteDetailSection}>
          <h3 className={styles.sectionLabel}>Author</h3>
          <div className={styles.authorContainer}>
            <img
              src={getAvatarUrl(note.author)}
              alt={note.author}
              className={styles.authorAvatar}
            />
            <span className={styles.sectionText}>{note.author}</span>
          </div>
        </div>
        <div className={styles.noteDetailSection}>
          <h3 className={styles.sectionLabel}>Created At</h3>
          <div className={styles.dateContainer}>
            <CalendarIcon className={styles.dateIcon} />
            <span className={styles.sectionText}>
              {formatDate(note.createdAt)}
            </span>
          </div>
        </div>
        <div className={styles.noteDetailSection}>
          <h3 className={styles.sectionLabel}>Updated At</h3>
          <div className={styles.dateContainer}>
            <CalendarIcon className={styles.dateIcon} />
            <span className={styles.sectionText}>
              {formatDate(note.updatedAt)}
            </span>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailModal;
