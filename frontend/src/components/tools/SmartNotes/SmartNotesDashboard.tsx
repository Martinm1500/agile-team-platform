import React, { useState, useRef, useEffect } from "react";
import styles from "./SmartNotesDashboard.module.css";
import {
  PlusIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  ChevronRightIcon,
} from "../../Icons";
import WorkspaceView from "./WorkspaceView";
import type {
  SmartNotesWorkspace,
  Note,
  EmptyNote,
  IndicatorNote,
  DisplayNote,
} from "./SmartNotesTypes";

const SmartNotesDashboard: React.FC = () => {
  const padNotes = (notes: Note[], workspaceId: number): DisplayNote[] => {
    const current: Note[] = notes;
    const numEmpty = 100 - current.length;

    // Add indicator note only if no notes exist
    if (current.length === 0) {
      const indicator: IndicatorNote = {
        id: -(workspaceId * 1000 + 1),
        type: "indicator",
      };
      const empties: EmptyNote[] = Array.from(
        { length: numEmpty - 1 },
        (_, i) => ({
          id: -(workspaceId * 1000 + i + 2),
          type: "empty",
        })
      );
      return [indicator, ...empties];
    } else if (numEmpty > 0) {
      const empties: EmptyNote[] = Array.from({ length: numEmpty }, (_, i) => ({
        id: -(workspaceId * 1000 + current.length + i + 1),
        type: "empty",
      }));
      return [...current, ...empties];
    } else {
      return current.slice(0, 100);
    }
  };

  const [workspaces, setWorkspaces] = useState<SmartNotesWorkspace[]>(() => {
    const savedWorkspaces = localStorage.getItem("workspaces");
    const ws: SmartNotesWorkspace[] = savedWorkspaces
      ? JSON.parse(savedWorkspaces)
      : [];
    return ws.map((w) => ({
      ...w,
      notes: padNotes(w.notes as Note[], w.id),
    }));
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceToDelete, setWorkspaceToDelete] = useState<number | null>(
    null
  );
  const [currentWorkspace, setCurrentWorkspace] =
    useState<SmartNotesWorkspace | null>(workspaces[0] || null);
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

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

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

  const handleOpenWorkspace = (id: number) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      setCurrentWorkspace(workspace);
      setShowWorkspaceDropdown(false);
      setOpenMenuWorkspaceId(null);
      setRenamingWorkspaceId(null);
      setIsCreatingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = (id: number) => {
    setWorkspaceToDelete(id);
    setShowDeleteModal(true);
    setOpenMenuWorkspaceId(null);
  };

  const confirmDelete = () => {
    if (workspaceToDelete) {
      const newWorkspaces = workspaces.filter(
        (workspace) => workspace.id !== workspaceToDelete
      );
      setWorkspaces(newWorkspaces);
      if (currentWorkspace?.id === workspaceToDelete) {
        setCurrentWorkspace(newWorkspaces[0] || null);
      }
    }
    setShowDeleteModal(false);
    setWorkspaceToDelete(null);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setWorkspaceTitle("");
  };

  const generateEmpties = (
    count: number,
    workspaceId: number
  ): DisplayNote[] => {
    // For new workspaces, add an indicator note and the rest as empty notes
    const indicator: IndicatorNote = {
      id: -(workspaceId * 1000 + 1),
      type: "indicator",
    };

    const empties: EmptyNote[] = Array.from({ length: count - 1 }, (_, i) => ({
      id: -(workspaceId * 1000 + i + 2),
      type: "empty",
    }));

    return [indicator, ...empties];
  };

  const createWorkspace = () => {
    if (!workspaceTitle.trim()) {
      alert("Workspace title cannot be empty.");
      return;
    }
    const newId = Date.now();
    const newWorkspace: SmartNotesWorkspace = {
      id: newId,
      title: workspaceTitle.trim(),
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      notes: generateEmpties(100, newId),
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
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
    const ws = workspaces.find((w) => w.id === id);
    if (ws) {
      setRenameTitle(ws.title);
      setRenamingWorkspaceId(id);
      setOpenMenuWorkspaceId(null);
      setIsCreatingWorkspace(false);
    }
  };

  const handleConfirmRename = () => {
    if (renamingWorkspaceId !== null && renameTitle.trim()) {
      const newWorkspaces = workspaces.map((w) =>
        w.id === renamingWorkspaceId ? { ...w, title: renameTitle.trim() } : w
      );
      setWorkspaces(newWorkspaces);
      if (currentWorkspace?.id === renamingWorkspaceId) {
        setCurrentWorkspace({ ...currentWorkspace, title: renameTitle.trim() });
      }
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

  const addNoteToWorkspace = (
    workspaceId: number,
    note: Omit<Note, "id" | "createdAt" | "updatedAt">,
    targetEmptyId?: number
  ) => {
    const newNote = {
      ...note,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newWorkspaces = workspaces.map((workspace) => {
      if (workspace.id === workspaceId) {
        const notesCopy = [...workspace.notes];
        let replaceIndex = -1;

        if (targetEmptyId !== undefined) {
          replaceIndex = notesCopy.findIndex((n) => n.id === targetEmptyId);
        }

        if (replaceIndex === -1) {
          // Find first indicator or empty note
          replaceIndex = notesCopy.findIndex(
            (n) => "type" in n && (n.type === "indicator" || n.type === "empty")
          );
        }

        if (replaceIndex === -1) {
          alert("No empty slots available.");
          return workspace;
        }

        notesCopy[replaceIndex] = newNote;

        // Regenerate: If there are real notes now, replace any indicator with empty
        const realNotesCount = notesCopy.filter(
          (n) =>
            !("type" in n) || (n.type !== "empty" && n.type !== "indicator")
        ).length;
        let updatedNotes = notesCopy;
        if (realNotesCount > 0) {
          updatedNotes = notesCopy.map((note) => {
            if ("type" in note && note.type === "indicator") {
              return { id: note.id, type: "empty" };
            }
            return note;
          });
        }

        return { ...workspace, notes: updatedNotes };
      }
      return workspace;
    });

    setWorkspaces(newWorkspaces);
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(
        newWorkspaces.find((w) => w.id === workspaceId) || null
      );
    }
    setShowForm(false);
  };

  const updateNoteInWorkspace = (updatedNote: Note) => {
    if (!currentWorkspace) return;
    const newWorkspaces = workspaces.map((workspace) =>
      workspace.id === currentWorkspace.id
        ? {
            ...workspace,
            notes: workspace.notes.map((note) =>
              "type" in note &&
              note.type !== "empty" &&
              note.type !== "indicator" &&
              note.id === updatedNote.id
                ? updatedNote
                : note
            ),
          }
        : workspace
    );
    setWorkspaces(newWorkspaces);
    setCurrentWorkspace(
      newWorkspaces.find((w) => w.id === currentWorkspace.id) || null
    );
    setShowForm(false);
  };

  const reorderNotesInWorkspace = (
    workspaceId: number,
    reorderedNotes: DisplayNote[]
  ) => {
    const newWorkspaces = workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? { ...workspace, notes: reorderedNotes }
        : workspace
    );
    setWorkspaces(newWorkspaces);
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(
        newWorkspaces.find((w) => w.id === workspaceId) || null
      );
    }
  };

  return (
    <div className={styles.smartnotesDashboard}>
      <div className={styles.header}>
        <h1>
          <div className={styles.title}>
            <h1>Notes /&nbsp;</h1>
          </div>
          <span className={styles.workspaceTitle}>
            {currentWorkspace ? currentWorkspace.title : "Select a Project"}
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
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`${styles.dropdownItem} ${
                      openMenuWorkspaceId === workspace.id ? styles.active : ""
                    }`}
                    onClick={() => handleOpenWorkspace(workspace.id)}
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
                        <span>{workspace.title}</span>
                        <button
                          className={styles.optionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuWorkspaceId(
                              openMenuWorkspaceId === workspace.id
                                ? null
                                : workspace.id
                            );
                          }}
                        >
                          <DotsHorizontalIcon />
                        </button>
                        {openMenuWorkspaceId === workspace.id && (
                          <div className={styles.itemMenu}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(workspace.id);
                              }}
                            >
                              Rename
                            </button>
                            <button
                              className={styles.deleteMenuBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkspace(workspace.id);
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
        <WorkspaceView
          workspace={currentWorkspace}
          onBack={() => setCurrentWorkspace(null)}
          onAddNote={addNoteToWorkspace}
          onUpdateNote={updateNoteInWorkspace}
          onReorderNotes={reorderNotesInWorkspace}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      ) : (
        <div className={styles.noWorkspaces}>
          No workspaces yet. Create one using the dropdown!
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

export default SmartNotesDashboard;
