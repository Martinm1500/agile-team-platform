import React, { useState } from "react";
import { KanbanIcon, SmartNoteIcon } from "../Icons";
import styles from "./CreateProjectModal.module.css";
import type { ProjectOptions } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, options: ProjectOptions) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectOptions, setNewProjectOptions] = useState<ProjectOptions>({
    kanban: false,
    smartNotes: false,
  });

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName, newProjectOptions);
    setNewProjectName("");
    setNewProjectOptions({
      kanban: false,
      smartNotes: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.createProjectModal}>
        <h2 className={styles.createProjectModalTitle}>Create project</h2>

        <div className={styles.createProjectModalInputGroup}>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className={styles.createProjectModalInput}
            autoFocus
          />
        </div>

        <div className={styles.createProjectModalSection}>
          <h3 className={styles.createProjectModalSectionTitle}>
            Integrate tools
          </h3>

          <div className={styles.createProjectModalOption}>
            <label className={styles.createProjectModalOptionLabel}>
              <input
                type="checkbox"
                checked={newProjectOptions.kanban}
                onChange={(e) =>
                  setNewProjectOptions({
                    ...newProjectOptions,
                    kanban: e.target.checked,
                  })
                }
                className={styles.createProjectModalOptionCheckbox}
              />
              <span className={styles.createProjectModalOptionText}>
                <span className={styles.createProjectModalOptionName}>
                  Kanban Workspace
                </span>
                <span className={styles.createProjectModalOptionDescription}>
                  Visual task and workflow management
                </span>
              </span>
              <div className={styles.toolCard}>
                <KanbanIcon />
              </div>
            </label>
          </div>

          <div className={styles.createProjectModalOption}>
            <label className={styles.createProjectModalOptionLabel}>
              <input
                type="checkbox"
                checked={newProjectOptions.smartNotes}
                onChange={(e) =>
                  setNewProjectOptions({
                    ...newProjectOptions,
                    smartNotes: e.target.checked,
                  })
                }
                className={styles.createProjectModalOptionCheckbox}
              />
              <span className={styles.createProjectModalOptionText}>
                <span className={styles.createProjectModalOptionName}>
                  Smart Notes Workspace
                </span>
                <span className={styles.createProjectModalOptionDescription}>
                  Organize and share project notes
                </span>
              </span>
              <div className={styles.toolCard}>
                <SmartNoteIcon />
              </div>
            </label>
          </div>
        </div>
        <div className={styles.createProjectModalActions}>
          <button
            className={`${styles.createProjectModalButton} ${styles.createProjectModalButtonCancel}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.createProjectModalButton} ${styles.createProjectModalButtonCreate}`}
            onClick={handleCreate}
            disabled={!newProjectName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
