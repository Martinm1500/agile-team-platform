import React, { useState, useRef, useEffect } from "react";
import type { Contact, User } from "../../types/index";
import styles from "./ContactItem.module.css";
import { EllipsisVIcon, TrashIcon } from "../Icons";

interface ContactItemProps {
  currentUser: User;
  contact: Contact;
  onClick: () => void;
  onRemove: (contactId: number) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  currentUser,
  contact,
  onClick,
  onRemove,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const otherUser =
    contact.requester.id === currentUser.id
      ? contact.target
      : contact.requester;

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(contact.id);
    setShowOptions(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions]);

  return (
    <div
      className={styles.contactItem}
      data-id={otherUser.id}
      onClick={onClick}
    >
      <div className={styles.contactAvatar}>
        <img src={otherUser.avatarUrl} alt={otherUser.username} />
        <span className={`${styles.statusIndicator} ${styles.active}`}></span>
      </div>
      <div className={styles.contactInfo}>
        <div className={styles.contactName}>{otherUser.username}</div>
      </div>

      <div className={styles.contactOptions} ref={optionsRef}>
        <button
          className={styles.contactActionBtn}
          onClick={handleOptionsClick}
          aria-label="Contact options"
        >
          <EllipsisVIcon />
        </button>

        {showOptions && (
          <div className={styles.contactOptionsMenu}>
            <button
              className={styles.deleteOption}
              onClick={handleRemoveClick}
              aria-label="Remove contact"
            >
              <span>Remove contact</span>
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactItem;
