import React, { useState, useEffect, useRef } from "react";
import styles from "./WorkspaceView.module.css";
import type { SmartNotesWorkspace, Note, DisplayNote } from "./SmartNotesTypes";
import NoteDetailModal from "./NoteDetailModal";
import NoteCard from "./NoteCard";

interface WorkspaceViewProps {
  workspace: SmartNotesWorkspace;
  onBack: () => void;
  onAddNote: (
    workspaceId: number,
    note: Omit<Note, "id" | "createdAt" | "updatedAt">,
    targetEmptyId?: number
  ) => void;
  onUpdateNote: (note: Note) => void;
  onReorderNotes: (workspaceId: number, reorderedNotes: DisplayNote[]) => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  workspace,
  onAddNote,
  onUpdateNote,
  onReorderNotes,
  showForm,
  setShowForm,
}) => {
  const [localNotes, setLocalNotes] = useState<DisplayNote[]>(workspace.notes);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [creatingAtId, setCreatingAtId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteType, setNoteType] = useState("knowledge");
  const [noteContent, setNoteContent] = useState("");
  const [noteSummary, setNoteSummary] = useState("");
  const [noteSourceLinks, setNoteSourceLinks] = useState("");
  const [noteTopics, setNoteTopics] = useState("");
  const [noteInsights, setNoteInsights] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("unknown");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [dragOverNoteId, setDragOverNoteId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalNotes(workspace.notes);
  }, [workspace.notes]);

  // Función para regenerar notas sin indicador si hay notas reales
  const regenerateNotesWithoutIndicator = (
    notes: DisplayNote[]
  ): DisplayNote[] => {
    const realNotes = notes.filter(
      (note) =>
        "type" in note && note.type !== "empty" && note.type !== "indicator"
    );

    // Si hay notas reales, reemplazar el indicador con notas vacías
    if (realNotes.length > 0) {
      return notes.map((note) => {
        if ("type" in note && note.type === "indicator") {
          return {
            id: note.id,
            type: "empty" as const,
          };
        }
        return note;
      });
    }

    return notes;
  };

  // Cerrar el formulario cuando cambia el workspace
  useEffect(() => {
    setShowForm(false);
    setIsEditing(false);
    setCreatingAtId(null);
    resetForm();
  }, [workspace.id, setShowForm]);

  const resetForm = () => {
    setNoteTitle("");
    setNoteType("knowledge");
    setNoteContent("");
    setNoteSummary("");
    setNoteSourceLinks("");
    setNoteTopics("");
    setNoteInsights("");
    setNoteAuthor("unknown");
    setEditingNoteId(null);
    setIsEditing(false);
  };

  const handleAddOrEditNote = () => {
    if (!noteTitle.trim()) {
      alert("Note title cannot be empty.");
      return;
    }

    const noteData: Omit<Note, "id" | "createdAt" | "updatedAt"> = {
      title: noteTitle,
      type: noteType,
      content: noteContent,
      summary: noteSummary,
      tags: noteTopics
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      sourceLinks: noteSourceLinks
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link),
      insights: noteInsights
        .split(",")
        .map((insight) => insight.trim())
        .filter((insight) => insight),
      author: noteAuthor,
      noteColor: "#252540",
      visibility: "privado",
    };

    if (isEditing && editingNoteId !== null) {
      onUpdateNote({
        ...noteData,
        id: editingNoteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddNote(workspace.id, noteData, creatingAtId ?? undefined);
      setCreatingAtId(null);
    }

    setShowForm(false);
    setIsEditing(false);
    resetForm();
  };

  const handleEditNote = (note: Note) => {
    setShowForm(true);
    setIsEditing(true);
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteType(note.type);
    setNoteContent(note.content);
    setNoteSummary(note.summary || "");
    setNoteSourceLinks(note.sourceLinks.join(", "));
    setNoteTopics(note.tags.join(", "));
    setNoteInsights(note.insights.join(", "));
    setNoteAuthor(note.author);
    setMenuOpenId(null);
  };

  const handleDeleteNote = (noteId: number) => {
    // Filtrar la nota a eliminar
    const updatedNotes = localNotes.map((note) =>
      "type" in note &&
      note.type !== "empty" &&
      note.type !== "indicator" &&
      note.id === noteId
        ? {
            id: -Date.now(),
            type: "empty" as const,
          }
        : note
    );

    // Verificar si quedan notas reales después de eliminar
    const remainingRealNotes = updatedNotes.filter(
      (note) =>
        "type" in note && note.type !== "empty" && note.type !== "indicator"
    );

    // Si no quedan notas reales, regenerar con indicador
    let finalNotes = updatedNotes;
    if (remainingRealNotes.length === 0) {
      finalNotes = updatedNotes.map((note, index) => {
        if (index === 0) {
          return {
            id: -(workspace.id * 1000 + 1),
            type: "indicator" as const,
          };
        }
        return note;
      });
    } else {
      // Si hay notas reales, asegurarse de que no haya indicadores
      finalNotes = regenerateNotesWithoutIndicator(updatedNotes);
    }

    setLocalNotes(finalNotes);
    onReorderNotes(workspace.id, finalNotes);
    setMenuOpenId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCreatingAtId(null);
    resetForm();
  };

  const toggleMenu = (noteId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (menuOpenId === noteId) {
      setMenuOpenId(null);
    } else {
      setMenuOpenId(noteId);
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    noteId: number
  ) => {
    e.dataTransfer.setData("text/plain", noteId.toString());
    e.currentTarget.classList.add(styles.dragging);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove(styles.dragging);
    setDragOverNoteId(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    noteId: number
  ) => {
    e.preventDefault();

    // Clear any existing timeout
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }

    setDragOverNoteId(noteId);
  };

  const handleDragLeave = () => {
    // Use timeout to prevent removing dragOver too soon
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }

    dragOverTimeoutRef.current = setTimeout(() => {
      setDragOverNoteId(null);
    }, 100); // Small delay to prevent flickering
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetNoteId: number
  ) => {
    e.preventDefault();

    // Clear the timeout if it exists
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }

    setDragOverNoteId(null);

    const draggedNoteId = Number(e.dataTransfer.getData("text/plain"));
    if (draggedNoteId === targetNoteId) return;

    const draggedIndex = localNotes.findIndex(
      (note) => note.id === draggedNoteId
    );
    const targetIndex = localNotes.findIndex(
      (note) => note.id === targetNoteId
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newNotes = [...localNotes];
    [newNotes[draggedIndex], newNotes[targetIndex]] = [
      newNotes[targetIndex],
      newNotes[draggedIndex],
    ];

    // Asegurarse de que no haya indicadores si hay notas reales
    const finalNotes = regenerateNotesWithoutIndicator(newNotes);

    setLocalNotes(finalNotes);
    onReorderNotes(workspace.id, finalNotes);
  };

  const handleNoteClick = (displayNote: DisplayNote) => {
    if ("type" in displayNote) {
      if (displayNote.type === "empty") {
        setCreatingAtId(displayNote.id);
        resetForm();
        setIsEditing(false);
        setShowForm(true);
      } else if (displayNote.type === "indicator") {
        // Handle indicator click - create a new note
        setCreatingAtId(displayNote.id);
        resetForm();
        setIsEditing(false);
        setShowForm(true);
      } else {
        setSelectedNote(displayNote as Note);
        setShowNoteDetail(true);
      }
    }
  };

  const handleCloseModal = () => {
    setShowNoteDetail(false);
    setSelectedNote(null);
  };

  return (
    <div className={styles.workspaceView}>
      {showForm ? (
        <div className={styles.noteForm}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
            >
              <option value="idea">Idea</option>
              <option value="knowledge">Knowledge</option>
              <option value="reference">Reference</option>
              <option value="analysis">Analysis</option>
              <option value="thinking">Thinking</option>
              <option value="research">Research</option>
              <option value="quick-note">Quick Note</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Summary</label>
            <input
              type="text"
              value={noteSummary}
              onChange={(e) => setNoteSummary(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Topics (Tags)</label>
            <input
              type="text"
              value={noteTopics}
              onChange={(e) => setNoteTopics(e.target.value)}
              placeholder="comma-separated"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Sources</label>
            <input
              type="text"
              value={noteSourceLinks}
              onChange={(e) => setNoteSourceLinks(e.target.value)}
              placeholder="comma-separated"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Insights</label>
            <input
              type="text"
              value={noteInsights}
              onChange={(e) => setNoteInsights(e.target.value)}
              placeholder="comma-separated"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Author</label>
            <input
              type="text"
              value={noteAuthor}
              onChange={(e) => setNoteAuthor(e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button onClick={handleAddOrEditNote}>
              {isEditing ? "Save" : "Save"}
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className={styles.notesGridContainer}>
          <div className={styles.notesGrid}>
            {localNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleNoteClick}
                onToggleMenu={toggleMenu}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
                isMenuOpen={menuOpenId === note.id}
                isDragOver={dragOverNoteId === note.id}
              />
            ))}
          </div>
        </div>
      )}

      {showNoteDetail && selectedNote && (
        <NoteDetailModal note={selectedNote} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default WorkspaceView;
