import React, { useState, useCallback } from "react";
import styles from "./ManageRolesModal.module.css";
import { ManageRolesIcon } from "../Icons";
import type { Role } from "../../types";

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles?: Role[];
  isLoading?: boolean;
  error?: string | null;
}

const permissionsConfig = [
  { key: "manageChannels", label: "Manage Channels" },
  { key: "manageMembers", label: "Manage Members" },
  { key: "manageRoles", label: "Manage Roles" },
  { key: "sendMessages", label: "Send Messages" },
  { key: "manageServers", label: "Manage Servers" },
  { key: "manageProjects", label: "Manage Projects" },
] as const;

type Permissions = {
  manageChannels: boolean;
  manageMembers: boolean;
  manageRoles: boolean;
  sendMessages: boolean;
  manageServers: boolean;
  manageProjects: boolean;
};

const defaultPermissions: Permissions = {
  manageChannels: false,
  manageMembers: false,
  manageRoles: false,
  sendMessages: true,
  manageServers: false,
  manageProjects: false,
};

const ManageRolesModal: React.FC<ManageRolesModalProps> = ({
  isOpen,
  onClose,
  roles = [],
  isLoading = false,
  error = null,
}) => {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newPermissions, setNewPermissions] =
    useState<Permissions>(defaultPermissions);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editPermissions, setEditPermissions] =
    useState<Permissions>(defaultPermissions);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<string | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEditRole = useCallback((role: Role) => {
    setNewRoleName(role.name || "");
    setNewRoleDescription(role.description || "");
    setEditPermissions({
      manageChannels: role.manageChannels,
      manageMembers: role.manageMembers,
      manageRoles: role.manageRoles,
      sendMessages: role.sendMessages,
      manageServers: role.manageServers,
      manageProjects: role.manageProjects,
    });
    setEditingRole(role);
    setLocalError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewPermissions(defaultPermissions);
    setEditPermissions(defaultPermissions);
    setEditingRole(null);
    setIsCreating(false);
    setLocalError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const roleName = newRoleName.trim();
    if (!roleName) {
      setLocalError("Role name is required");
      return;
    }

    const isEditing = !!editingRole;
    const duplicate = roles.some(
      (r) => r.name === roleName && (!isEditing || r.id !== editingRole?.id)
    );
    if (duplicate) {
      setLocalError("Role name already exists");
      return;
    }

    setLocalError(null);

    const permissions = isEditing ? editPermissions : newPermissions;
    const description = newRoleDescription.trim();

    if (isEditing && editingRole) {
      const updatedRoles = roles.map((r) =>
        r.id === editingRole.id
          ? { ...r, name: roleName, description, ...permissions }
          : r
      );
      //onSave(updatedRoles)
      console.log(updatedRoles);
      setEditingRole(null);
    } else {
      const newId =
        roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
      const serverId = roles[0]?.serverId || 1;
      const newRole: Role = {
        id: newId,
        serverId,
        name: roleName,
        description,
        ...permissions,
      };
      //onSave([...roles, newRole]);
      console.log(newRole);
      setIsCreating(false);
    }

    setNewRoleName("");
    setNewRoleDescription("");
    setNewPermissions(defaultPermissions);
    setEditPermissions(defaultPermissions);
  }, [
    newRoleName,
    roles,
    newRoleDescription,
    newPermissions,
    editPermissions,
    editingRole,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && newRoleName.trim()) {
        handleSubmit();
      }
    },
    [newRoleName, handleSubmit]
  );

  const handlePermissionChange = useCallback(
    (permission: keyof Permissions, value: boolean) => {
      if (editingRole) {
        setEditPermissions((prev) => ({ ...prev, [permission]: value }));
      } else {
        setNewPermissions((prev) => ({ ...prev, [permission]: value }));
      }
    },
    [editingRole]
  );

  const handleDeleteClick = useCallback((roleName: string) => {
    setDeleteConfirmRole(roleName);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmRole) {
      setDeleteConfirmRole(null);
    }
  }, [deleteConfirmRole]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmRole(null);
  }, []);

  if (!isOpen) return null;

  const isFormMode = isCreating || !!editingRole;
  const formPermissions = editingRole ? editPermissions : newPermissions;
  const formTitle = editingRole
    ? `Editing "${editingRole.name}"`
    : "Creating a new role";
  const formNameLabel = editingRole ? "Role Name" : "New Role Name";
  const formDescLabel = editingRole ? "Role Description" : "Role Description";
  const formPermLabel = editingRole ? "Permissions" : "Permissions";
  const submitButtonText = editingRole ? "Save Role" : "Add Role";
  const cancelButtonText = editingRole ? "Cancel Edit" : "Cancel";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {deleteConfirmRole ? (
          <div className={styles.ConfirmDeleteContent}>
            <h2 className={styles.title} id="modal-title">
              Confirm Delete Role
            </h2>
            <p className={styles.subtitle}>
              Are you sure you want to delete the role "{deleteConfirmRole}"?
              This action cannot be undone.
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
                {isLoading ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className={styles.title} id="modal-title">
              <ManageRolesIcon className={styles.titleIcon} /> Manage Roles
            </h2>

            {!isFormMode ? (
              <>
                <p className={styles.subtitle}>
                  Add, edit, or remove roles and their permissions for the
                  server
                </p>

                <div className={styles.rolesList}>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <div key={role.id} className={styles.roleItem}>
                        <div className={styles.roleInfo}>
                          <div>
                            <span>{role.name}</span>
                          </div>
                          <div className={styles.permissions}>
                            {permissionsConfig
                              .filter(({ key }) => role[key])
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
                            onClick={() => handleEditRole(role)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => handleDeleteClick(role.name || "")}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noRoles}>No roles defined.</p>
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
                    Create New Role
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
                    <label htmlFor="newRole" className={styles.label}>
                      {formNameLabel}
                    </label>
                    <input
                      type="text"
                      id="newRole"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter role name"
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
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      placeholder="Enter role description"
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
                      editingRole ? styles.saveButton : styles.submitButton
                    }
                    onClick={handleSubmit}
                    disabled={!newRoleName.trim() || isLoading}
                  >
                    {isLoading
                      ? editingRole
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

export default ManageRolesModal;
