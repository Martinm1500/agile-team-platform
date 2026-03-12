import React from "react";
import styles from "./TaskDetails.module.css";

import type { Task } from "./TaskCard";

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getAvatarUrl = (id: number) => {
    return `https://i.pravatar.cc/150?u=${id}`;
  };

  const statusTextMap: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{task.title}</h2>
          <span
            className={`${styles.statusBadge} ${
              styles[`statusBadge-${task.status?.replace("_", "-")}`]
            }`}
          >
            {statusTextMap[task.status || ""]}
          </span>
        </div>
        <div className={styles.modalSection}>
          <h3 className={styles.sectionLabel}>Description</h3>
          <p className={styles.sectionText}>{task.description}</p>
        </div>
        <div className={styles.modalSection}>
          <h3 className={styles.sectionLabel}>Assigned to</h3>
          <div className={styles.assignedToContainer}>
            {task.assigneeId && (
              <img
                src={task.assignee?.avatarUrl || getAvatarUrl(task.assigneeId)}
                alt={task.assignee?.username || ""}
                className={styles.avatar}
              />
            )}
            <span className={styles.sectionText}>
              {task.assignee?.username ||
                (task.assigneeId ? `User ${task.assigneeId}` : "Unassigned")}
            </span>
          </div>
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.actionButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
