import React from "react";
import { CloseIcon } from "../Icons";
import styles from "./ShortcutItem.module.css";

interface ShortcutProps {
  shortcut: {
    id: number;
    name: string;
    avatarUrl: string;
    unread: boolean;
  };
  onClick: () => void;
  onHide?: (conversationId: number) => void;
  isSelected?: boolean;
}

const ShortcutItem: React.FC<ShortcutProps> = ({
  shortcut,
  onClick,
  onHide,
  isSelected = false,
}) => {
  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide?.(shortcut.id);
  };

  return (
    <div
      className={`${styles.conversationItem} ${
        isSelected ? styles.selected : ""
      }`}
      data-id={shortcut.id}
      onClick={onClick}
    >
      <div className={styles.conversationAvatar}>
        <img src={shortcut.avatarUrl} alt={shortcut.name} />
        <span className={`${styles.statusIndicator} ${styles.active}`} />
      </div>

      <div className={styles.conversationInfo}>
        <div className={styles.conversationName}>{shortcut.name}</div>
      </div>

      <div className={styles.deleteIconWrapper} onClick={handleHide}>
        {shortcut.unread && <div className={styles.badge} />}
        <CloseIcon className={styles.closeIcon} />
      </div>
    </div>
  );
};

export default ShortcutItem;
