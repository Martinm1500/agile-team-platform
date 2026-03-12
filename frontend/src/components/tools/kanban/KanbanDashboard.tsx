import React, { useState, useRef, useEffect } from "react";
import styles from "./KanbanDashboard.module.css";
import {
  PlusIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  ChevronRightIcon,
} from "../../Icons";
import KanbanView from "./KanbanView";
import { useKanban } from "../../../features/kanbanWorkspaces/useKanban";
import type { User } from "../../../types";

interface KanbanProps {
  currentUser: User;
}

const KanbanDashboard: React.FC<KanbanProps> = ({ currentUser }) => {
  const { kanbans, createKanban, updateKanban, removeKanban } = useKanban();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number | null>(
    null
  );
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(
    null
  );
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [openMenuWorkspaceId, setOpenMenuWorkspaceId] = useState<number | null>(
    null
  );
  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState<number | null>(
    null
  );
  const [renameTitle, setRenameTitle] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWorkspace =
    kanbans.find((w) => w.id === currentWorkspaceId) ?? null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isCreatingWorkspace || renamingWorkspaceId !== null) {
          return;
        }
        setShowWorkspaceDropdown(false);
        setOpenMenuWorkspaceId(null);
        setRenamingWorkspaceId(null);
        setIsCreatingWorkspace(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreatingWorkspace, renamingWorkspaceId]);

  useEffect(() => {
    if (
      currentWorkspaceId &&
      !kanbans.find((w) => w.id === currentWorkspaceId)
    ) {
      setCurrentWorkspaceId(null);
    }
  }, [kanbans, currentWorkspaceId]);

  const handleOpenWorkspace = (id: number) => {
    setCurrentWorkspaceId(id);
    setShowWorkspaceDropdown(false);
    setOpenMenuWorkspaceId(null);
    setRenamingWorkspaceId(null);
    setIsCreatingWorkspace(false);
  };

  const handleDeleteWorkspace = (id: number) => {
    setWorkspaceToDelete(id);
    setShowDeleteModal(true);
    setOpenMenuWorkspaceId(null);
  };

  const confirmDelete = async () => {
    if (workspaceToDelete) {
      await removeKanban(workspaceToDelete);
    }
    setShowDeleteModal(false);
    setWorkspaceToDelete(null);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const createWorkspace = async () => {
    if (!workspaceTitle.trim()) {
      alert("Workspace title cannot be empty.");
      return;
    }
    try {
      const newKanban = await createKanban(workspaceTitle.trim()).unwrap();
      setCurrentWorkspaceId(newKanban.id);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
    setWorkspaceTitle("");
    setIsCreatingWorkspace(false);
    setShowWorkspaceDropdown(false);
    setOpenMenuWorkspaceId(null);
  };

  const startCreatingWorkspace = () => {
    setIsCreatingWorkspace(true);
    setWorkspaceTitle("");
    setOpenMenuWorkspaceId(null);
    setRenamingWorkspaceId(null);
  };

  const cancelCreatingWorkspace = () => {
    setIsCreatingWorkspace(false);
    setWorkspaceTitle("");
  };

  useEffect(() => {
    if (isCreatingWorkspace && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingWorkspace]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      createWorkspace();
    } else if (e.key === "Escape") {
      cancelCreatingWorkspace();
    }
  };

  const handleStartRename = (id: number) => {
    const ws = kanbans.find((w) => w.id === id);
    if (ws) {
      setRenameTitle(ws.name);
      setRenamingWorkspaceId(id);
      setOpenMenuWorkspaceId(null);
      setIsCreatingWorkspace(false);
    }
  };

  const handleConfirmRename = async () => {
    if (renamingWorkspaceId !== null && renameTitle.trim()) {
      await updateKanban(renamingWorkspaceId, { name: renameTitle.trim() });
      setRenamingWorkspaceId(null);
      setRenameTitle("");
    }
  };

  const handleCancelRename = () => {
    setRenamingWorkspaceId(null);
    setRenameTitle("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirmRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  return (
    <div className={styles.kanbanDashboard}>
      <div className={styles.header}>
        <h1>
          <div className={styles.title}>
            <span>Kanban /&nbsp;</span>
          </div>
          <span className={styles.workspaceTitle}>
            {currentWorkspace ? currentWorkspace.name : "Select a Project"}
          </span>
        </h1>
        <div className={styles.headerActions}>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={styles.dropdownBtn}
              onClick={() => {
                const newShow = !showWorkspaceDropdown;
                setShowWorkspaceDropdown(newShow);
                if (!newShow) {
                  setOpenMenuWorkspaceId(null);
                  setRenamingWorkspaceId(null);
                  setIsCreatingWorkspace(false);
                }
              }}
            >
              {showWorkspaceDropdown ? (
                <ChevronRightIcon />
              ) : (
                <ChevronDownIcon />
              )}
            </button>
            {showWorkspaceDropdown && (
              <div className={styles.dropdownMenu}>
                {kanbans.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`${styles.dropdownItem} ${
                      openMenuWorkspaceId === workspace.id ? styles.active : ""
                    }`}
                    onClick={() => handleOpenWorkspace(workspace.id!)}
                  >
                    {renamingWorkspaceId === workspace.id ? (
                      <div
                        className={styles.createInputContainer}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={handleRenameKeyDown}
                          placeholder="Workspace name"
                          className={styles.createInput}
                          autoFocus
                        />
                        <div className={styles.createInputActions}>
                          <button
                            onClick={handleConfirmRename}
                            className={styles.confirmCreateBtn}
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className={styles.cancelCreateBtn}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span>{workspace.name}</span>
                        {workspace.ownerId === currentUser.id && (
                          <button
                            className={styles.optionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuWorkspaceId(
                                openMenuWorkspaceId === workspace.id
                                  ? null
                                  : workspace.id!
                              );
                            }}
                          >
                            <DotsHorizontalIcon />
                          </button>
                        )}

                        {openMenuWorkspaceId === workspace.id &&
                          workspace.ownerId === currentUser.id && (
                            <div className={styles.itemMenu}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename(workspace.id!);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                className={styles.deleteMenuBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkspace(workspace.id!);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                ))}
                {isCreatingWorkspace ? (
                  <div className={styles.createInputContainer}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={workspaceTitle}
                      onChange={(e) => setWorkspaceTitle(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Workspace name"
                      className={styles.createInput}
                    />
                    <div className={styles.createInputActions}>
                      <button
                        onClick={createWorkspace}
                        className={styles.confirmCreateBtn}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelCreatingWorkspace}
                        className={styles.cancelCreateBtn}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.createBtn}
                    onClick={startCreatingWorkspace}
                  >
                    <PlusIcon />
                    Create Workspace
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentWorkspace ? (
        <KanbanView
          currentKanban={currentWorkspace}
          currentUser={currentUser}
        />
      ) : (
        <div className={styles.noWorkspaces}>
          Select a workspace or create one using the dropdown!
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this workspace?</p>
            <button className={styles.confirmBtn} onClick={confirmDelete}>
              Yes
            </button>
            <button className={styles.cancelBtn} onClick={closeModal}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanDashboard;
