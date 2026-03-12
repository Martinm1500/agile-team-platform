import React from "react";
import styles from "./QuizzesTable.module.css";
import type { Quiz } from "./QuizTypes";
import { StartIcon, TrashIcon, ShareAltIcon, PencilIcon } from "../../Icons";

interface QuizzesTableProps {
  quizzes: Quiz[];
  onEdit: (id: number) => void;
  onStart: (id: number) => void;
  onShare: () => void;
  onDelete: (id: number) => void;
}

const QuizzesTable: React.FC<QuizzesTableProps> = ({
  quizzes,
  onEdit,
  onStart,
  onShare,
  onDelete,
}) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Questions</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {quizzes.map((quiz) => (
          <tr key={quiz.id}>
            <td>{quiz.name}</td>
            <td>{quiz.questions.length}</td>
            <td>{quiz.created}</td>
            <td className={styles.quizActions}>
              <button
                onClick={() => onEdit(quiz.id)}
                className={`${styles.actionBtn} ${styles.editBtn}`}
                aria-label="Edit quiz"
                data-tooltip="Edit"
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => onStart(quiz.id)}
                className={`${styles.actionBtn} ${styles.startBtn}`}
                aria-label="Start quiz"
                data-tooltip="Start"
              >
                <StartIcon />
              </button>
              <button
                onClick={onShare}
                className={`${styles.actionBtn} ${styles.shareBtn}`}
                aria-label="Share quiz"
                data-tooltip="Share"
              >
                <ShareAltIcon />
              </button>
              <button
                onClick={() => onDelete(quiz.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label="Delete quiz"
                data-tooltip="Delete"
              >
                <TrashIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default QuizzesTable;
