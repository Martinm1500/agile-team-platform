// src/helpers/workspaceHelpers.ts
import type {
  DisplayNote,
  IndicatorNote,
  EmptyNote,
  Project,
  SmartNotesWorkspace,
  KanbanWorkspace,
} from "../types";

/**
 * Genera un arreglo de DisplayNote que comienza con un "indicator"
 * seguido de (count - 1) notas vacías.
 */
export const generateEmpties = (
  count: number,
  workspaceId: number
): DisplayNote[] => {
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

/**
 * Guarda (si no existe) un SmartNotesWorkspace en localStorage bajo la key "workspaces".
 * Si project.smartNotesWorkspaceId es falsy no hace nada.
 */
export const saveSmartNotesWorkspace = (project: Project) => {
  if (!project.smartNotesWorkspaceId) return;

  const saved = localStorage.getItem("workspaces");
  const ws: SmartNotesWorkspace[] = saved ? JSON.parse(saved) : [];

  // evita duplicados
  if (ws.find((w) => w.id === project.smartNotesWorkspaceId)) return;

  ws.push({
    id: project.smartNotesWorkspaceId,
    projectId: project.id,
    title: project.name,
    notes: generateEmpties(100, project.smartNotesWorkspaceId),
  });

  localStorage.setItem("workspaces", JSON.stringify(ws));
};

/**
 * Guarda (si no existe) un KanbanWorkspace en localStorage bajo la key "kanbanWorkspaces".
 * Si project.kanbanWorkspaceId es falsy no hace nada.
 */
export const saveKanbanWorkspace = (project: Project) => {
  if (!project.kanbanWorkspaceId) return;

  const saved = localStorage.getItem("kanbanWorkspaces");
  const ws: KanbanWorkspace[] = saved ? JSON.parse(saved) : [];

  // evita duplicados
  if (ws.find((w) => w.id === project.kanbanWorkspaceId)) return;

  ws.push({
    id: project.kanbanWorkspaceId,
    projectId: project.id,
    title: project.name,
    tasks: [],
  });

  localStorage.setItem("kanbanWorkspaces", JSON.stringify(ws));
};

/**
 * Inicializa workspaces (smart notes y kanban) para un array de proyectos.
 * Usa las funciones saveSmartNotesWorkspace/saveKanbanWorkspace para la lógica de persistencia.
 */
export const initializeWorkspaces = (projects: Project[]) => {
  projects.forEach((project) => {
    // normalizo el título tal como lo venías haciendo en el componente:
    const projectTitle = project.name
      .split("-")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");

    // Si querés que los títulos guardados respeten la transformación,
    // asigno temporalmente el title antes de guardar (no modifica el project original).
    if (project.smartNotesWorkspaceId) {
      const saved = localStorage.getItem("workspaces");
      const smartWs: SmartNotesWorkspace[] = saved ? JSON.parse(saved) : [];

      if (!smartWs.find((w) => w.id === project.smartNotesWorkspaceId)) {
        smartWs.push({
          id: project.smartNotesWorkspaceId,
          projectId: project.id,
          title: projectTitle,
          notes: generateEmpties(100, project.smartNotesWorkspaceId),
        });
        localStorage.setItem("workspaces", JSON.stringify(smartWs));
      }
    }

    if (project.kanbanWorkspaceId) {
      const savedKanban = localStorage.getItem("kanbanWorkspaces");
      const kanbanWs: KanbanWorkspace[] = savedKanban
        ? JSON.parse(savedKanban)
        : [];

      if (!kanbanWs.find((w) => w.id === project.kanbanWorkspaceId)) {
        kanbanWs.push({
          id: project.kanbanWorkspaceId,
          projectId: project.id,
          title: projectTitle,
          tasks: [],
        });
        localStorage.setItem("kanbanWorkspaces", JSON.stringify(kanbanWs));
      }
    }
  });
};

export default {
  generateEmpties,
  saveSmartNotesWorkspace,
  saveKanbanWorkspace,
  initializeWorkspaces,
};
