import React from "react";
import styles from "./TaskCard.module.css";
import type { ProjectMember } from "../../../features/servers/serverTypes";

export interface Task {
  id?: number;
  kanbanId: number;
  title: string;
  description?: string;
  columnId: number;
  assigneeId?: number | null;
  creatorUserId?: number | null;
  status?: string;
  assignee?: ProjectMember;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
  openModal: boolean;
  onOpenTaskModal: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  openModal,
  onOpenTaskModal,
}) => {

  const getAvatarUrl = (id: number) => {
    return `https://randomuser.me/api/portraits/men/22.jpg`;
  };

  const statusTextMap: Record<string, string> = {
    TODO: "To do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
    UNKNOWN: "Unknown",
  };

  const handleCardClick = () => {
    if (openModal) {
      onOpenTaskModal();
    }
    onClick();
  };

  return (
    <div
      className={styles.backlogTaskCard}
      draggable
      onDragStart={onDragStart}
      onClick={handleCardClick}
    >
      <div className={styles.taskHeader}>
        <span className={styles.taskTitle}>{task.title}</span>
        {task.status && (
          <span
            className={`${styles.taskStatus} ${
              styles[
                `taskStatus-${task.status.replace("_", "-").toLowerCase()}`
              ]
            }`}
          >
            {statusTextMap[task.status] || "Unknown"}
          </span>
        )}
      </div>
      {task.description && (
        <div className={styles.taskDescription}>{task.description}</div>
      )}
      <div className={styles.taskFooter}>
        {task.assigneeId && (
          <>
            <img
              src={task.assignee?.avatarUrl || getAvatarUrl(task.assigneeId)}
              alt={task.assignee?.username || ""}
              className={styles.taskAvatar}
            />
            {task.assignee?.username && (
              <span className={styles.taskAssigneeName}>
                {task.assignee.username}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
