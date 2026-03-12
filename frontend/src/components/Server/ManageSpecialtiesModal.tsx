import React, { useState, useCallback } from "react";
import styles from "./ManageSpecialtiesModal.module.css";
import { ManageRolesIcon } from "../Icons";
import type { Specialty } from "../../types";

interface ManageSpecialtiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (specialties: Specialty[]) => void;
  onDelete: (specialtyName: string) => void;
  specialties?: Specialty[];
  projectId: number;
  isLoading?: boolean;
  error?: string | null;
}

const permissionsConfig = [
  { key: "createTask", label: "Create Task" },
  { key: "editTask", label: "Edit Task" },
  { key: "deleteTask", label: "Delete Task" },
  { key: "moveTask", label: "Move Task" },
  { key: "assignTask", label: "Assign Task" },
  { key: "manageColumns", label: "Manage Columns" },
  { key: "createNote", label: "Create Note" },
  { key: "editNote", label: "Edit Note" },
  { key: "deleteNote", label: "Delete Note" },
  { key: "moveNote", label: "Move Note" },
  { key: "lockNote", label: "Lock Note" },
  { key: "manageCategories", label: "Manage Categories" },
] as const;

type Permissions = {
  createTask: boolean;
  editTask: boolean;
  deleteTask: boolean;
  moveTask: boolean;
  assignTask: boolean;
  manageColumns: boolean;
  createNote: boolean;
  editNote: boolean;
  deleteNote: boolean;
  moveNote: boolean;
  lockNote: boolean;
  manageCategories: boolean;
};

const defaultPermissions: Permissions = {
  createTask: true,
  editTask: true,
  deleteTask: true,
  moveTask: true,
  assignTask: true,
  manageColumns: true,
  createNote: true,
  editNote: true,
  deleteNote: true,
  moveNote: true,
  lockNote: true,
  manageCategories: true,
};

const ManageSpecialtiesModal: React.FC<ManageSpecialtiesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  specialties = [],
  projectId,
  isLoading = false,
  error = null,
}) => {
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [newSpecialtyDescription, setNewSpecialtyDescription] = useState("");
  const [newPermissions, setNewPermissions] =
    useState<Permissions>(defaultPermissions);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null
  );
  const [editPermissions, setEditPermissions] =
    useState<Permissions>(defaultPermissions);
  const [deleteConfirmSpecialty, setDeleteConfirmSpecialty] = useState<
    string | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEditSpecialty = useCallback((specialty: Specialty) => {
    setNewSpecialtyName(specialty.name || "");
    setNewSpecialtyDescription(specialty.description || "");
    setEditPermissions({
      createTask: specialty.createTask,
      editTask: specialty.editTask,
      deleteTask: specialty.deleteTask,
      moveTask: specialty.moveTask,
      assignTask: specialty.assignTask,
      manageColumns: specialty.manageColumns,
      createNote: specialty.createNote,
      editNote: specialty.editNote,
      deleteNote: specialty.deleteNote,
      moveNote: specialty.moveNote,
      lockNote: specialty.lockNote,
      manageCategories: specialty.manageCategories,
    });
    setEditingSpecialty(specialty);
    setLocalError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setNewSpecialtyName("");
    setNewSpecialtyDescription("");
    setNewPermissions(defaultPermissions);
    setEditPermissions(defaultPermissions);
    setEditingSpecialty(null);
    setIsCreating(false);
    setLocalError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const specialtyName = newSpecialtyName.trim();
    if (!specialtyName) {
      setLocalError("Specialty name is required");
      return;
    }

    const isEditing = !!editingSpecialty;
    const duplicate = specialties.some(
      (s) =>
        s.name === specialtyName &&
        (!isEditing || s.id !== editingSpecialty?.id)
    );
    if (duplicate) {
      setLocalError("Specialty name already exists");
      return;
    }

    setLocalError(null);

    const permissions = isEditing ? editPermissions : newPermissions;
    const description = newSpecialtyDescription.trim();

    if (isEditing && editingSpecialty) {
      const updatedSpecialties = specialties.map((s) =>
        s.id === editingSpecialty.id
          ? { ...s, name: specialtyName, description, ...permissions }
          : s
      );
      onSave(updatedSpecialties);
      setEditingSpecialty(null);
    } else {
      const newId =
        specialties.length > 0
          ? Math.max(...specialties.map((s) => s.id)) + 1
          : 1;
      const newSpecialty: Specialty = {
        id: newId,
        projectId,
        name: specialtyName,
        description,
        ...permissions,
      };
      onSave([...specialties, newSpecialty]);
      setIsCreating(false);
    }

    setNewSpecialtyName("");
    setNewSpecialtyDescription("");
    setNewPermissions(defaultPermissions);
    setEditPermissions(defaultPermissions);
  }, [
    newSpecialtyName,
    newSpecialtyDescription,
    newPermissions,
    editPermissions,
    editingSpecialty,
    specialties,
    onSave,
    projectId,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && newSpecialtyName.trim()) {
        handleSubmit();
      }
    },
    [newSpecialtyName, handleSubmit]
  );

  const handlePermissionChange = useCallback(
    (permission: keyof Permissions, value: boolean) => {
      if (editingSpecialty) {
        setEditPermissions((prev) => ({ ...prev, [permission]: value }));
      } else {
        setNewPermissions((prev) => ({ ...prev, [permission]: value }));
      }
    },
    [editingSpecialty]
  );

  const handleDeleteClick = useCallback((specialtyName: string) => {
    setDeleteConfirmSpecialty(specialtyName);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmSpecialty) {
      onDelete(deleteConfirmSpecialty);
      setDeleteConfirmSpecialty(null);
    }
  }, [deleteConfirmSpecialty, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmSpecialty(null);
  }, []);

  if (!isOpen) return null;

  const isFormMode = isCreating || !!editingSpecialty;
  const formPermissions = editingSpecialty ? editPermissions : newPermissions;
  const formTitle = editingSpecialty
    ? `Editing "${editingSpecialty.name}"`
    : "Creating a new specialty";
  const formNameLabel = editingSpecialty
    ? "Specialty Name"
    : "New Specialty Name";
  const formDescLabel = editingSpecialty
    ? "Specialty Description"
    : "Specialty Description";
  const formPermLabel = editingSpecialty ? "Permissions" : "Permissions";
  const submitButtonText = editingSpecialty ? "Save" : "Add Specialty";
  const cancelButtonText = editingSpecialty ? "Cancel" : "Cancel";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {deleteConfirmSpecialty ? (
          <div className={styles.ConfirmDeleteContent}>
            <h2 className={styles.title} id="modal-title">
              Confirm Delete Specialty
            </h2>
            <p className={styles.subtitle}>
              Are you sure you want to delete the specialty "
              {deleteConfirmSpecialty}"? This action cannot be undone.
            </p>
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Specialty"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className={styles.title} id="modal-title">
              <ManageRolesIcon className={styles.titleIcon} /> Manage
              Specialties
            </h2>

            {!isFormMode ? (
              <>
                <p className={styles.subtitle}>
                  Add, edit, or remove specialties and their permissions for the
                  project
                </p>

                <div className={styles.rolesList}>
                  {specialties.length > 0 ? (
                    specialties.map((specialty) => (
                      <div key={specialty.id} className={styles.roleItem}>
                        <div className={styles.roleInfo}>
                          <div>
                            <span>{specialty.name}</span>
                          </div>
                          <div className={styles.permissions}>
                            {permissionsConfig
                              .filter(({ key }) => specialty[key])
                              .map(({ key, label }) => (
                                <span
                                  key={key}
                                  className={styles.permissionTag}
                                >
                                  {label}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className={styles.roleActions}>
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleEditSpecialty(specialty)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() =>
                              handleDeleteClick(specialty.name || "")
                            }
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noRoles}>No specialties defined.</p>
                  )}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                  <button
                    type="button"
                    className={styles.submitButton}
                    onClick={() => {
                      setIsCreating(true);
                      setLocalError(null);
                    }}
                    disabled={isLoading}
                  >
                    New specialty
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.subtitle}>{formTitle}</p>

                {error && <p className={styles.error}>{error}</p>}
                {localError && <p className={styles.error}>{localError}</p>}

                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="newSpecialty" className={styles.label}>
                      {formNameLabel}
                    </label>
                    <input
                      type="text"
                      id="newSpecialty"
                      value={newSpecialtyName}
                      onChange={(e) => setNewSpecialtyName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter specialty name"
                      disabled={isLoading}
                      className={styles.input}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="newDescription" className={styles.label}>
                      {formDescLabel}
                    </label>
                    <input
                      type="text"
                      id="newDescription"
                      value={newSpecialtyDescription}
                      onChange={(e) =>
                        setNewSpecialtyDescription(e.target.value)
                      }
                      placeholder="Enter specialty description"
                      disabled={isLoading}
                      className={styles.input}
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{formPermLabel}</label>
                    <div className={styles.permissionsList}>
                      {permissionsConfig.map(({ key, label }) => (
                        <label key={key} className={styles.optionLabel}>
                          <input
                            type="checkbox"
                            checked={formPermissions[key]}
                            onChange={(e) =>
                              handlePermissionChange(key, e.target.checked)
                            }
                            disabled={isLoading}
                            className={styles.optionCheckbox}
                          />
                          <span className={styles.optionText}>
                            <span className={styles.optionName}>{label}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.footer}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {cancelButtonText}
                  </button>
                  <button
                    type="button"
                    className={
                      editingSpecialty ? styles.saveButton : styles.submitButton
                    }
                    onClick={handleSubmit}
                    disabled={!newSpecialtyName.trim() || isLoading}
                  >
                    {isLoading
                      ? editingSpecialty
                        ? "Saving..."
                        : "Adding..."
                      : submitButtonText}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageSpecialtiesModal;
