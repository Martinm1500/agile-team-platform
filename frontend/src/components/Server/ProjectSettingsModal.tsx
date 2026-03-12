import React, { useState, useEffect } from "react";
import type { Project } from "../../types";
import styles from "./ProjectSettingsModal.module.css";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: number, name: string) => void;
  onDelete: (projectId: number) => void;
  project: Project;
  canManageProjects: boolean;
  onOpenManageSpecialties: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  project,
  canManageProjects,
  onOpenManageSpecialties,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (project) {
      const humanizedName = project.name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setName(humanizedName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  const projectId = project.id;
  const isValidName = name.trim().length > 0;

  const handleSave = () => {
    if (!isValidName || !canManageProjects) return;
    onSave(projectId, name);
    onClose();
  };

  const handleDelete = () => {
    onDelete(projectId);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit: {project.name}</h2>
        <div className={styles.inputGroup}>
          <label className={styles.sectionTitle}>Project Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            disabled={!canManageProjects}
          />
        </div>

        <div className={styles.inputGroup}>
          <button
            className={styles.buttonSave}
            onClick={onOpenManageSpecialties}
            disabled={!canManageProjects}
          >
            Manage Specialties
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonCancel} onClick={onClose}>
            Cancel
          </button>
          {canManageProjects && (
            <>
              <button
                className={styles.buttonSave}
                onClick={handleSave}
                disabled={!isValidName}
              >
                Save
              </button>
              <button className={styles.buttonDelete} onClick={handleDelete}>
                Delete project
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
