import { useState, useCallback, useEffect } from "react";
import { WEB_TEMPLATE, JAVA_TEMPLATE, PYTHON_TEMPLATE } from "./constants";
import type { Tab, Workspace } from "./CodeEditorTypes";

const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const loadWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setShowWorkspaceModal(false);
    return workspace.tabs;
  }, []);

  // Cargar workspaces desde localStorage al renderizar inicialmente
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem("codeEditorWorkspaces");
    if (savedWorkspaces) {
      try {
        const parsedWorkspaces = JSON.parse(savedWorkspaces);
        setWorkspaces(parsedWorkspaces);
        if (parsedWorkspaces.length > 0) {
          loadWorkspace(parsedWorkspaces[0]);
        }
      } catch (error) {
        console.error("Failed to parse saved workspaces", error);
      }
    }
  }, [loadWorkspace]);

  // Guardar workspaces en localStorage cuando cambian
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem("codeEditorWorkspaces", JSON.stringify(workspaces));
    }
  }, [workspaces]);

  const createNewWorkspace = useCallback(() => {
    setShowWorkspaceModal(true);
    setShowTemplateModal(false);
    setNewWorkspaceName("");
  }, []);

  const saveCurrentWorkspace = useCallback(
    (template: string) => {
      if (!newWorkspaceName.trim()) return;

      let templateTabs: Tab[];
      switch (template) {
        case "java":
          templateTabs = JAVA_TEMPLATE;
          break;
        case "python":
          templateTabs = PYTHON_TEMPLATE;
          break;
        case "web":
        default:
          templateTabs = WEB_TEMPLATE;
      }

      const newTabs = templateTabs.map((tab) => ({
        ...tab,
        id: Date.now().toString() + tab.id,
      }));

      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName.trim(),
        tabs: newTabs,
        lastModified: new Date().toISOString(),
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      setShowTemplateModal(false);
      setShowWorkspaceModal(false);

      return newTabs;
    },
    [newWorkspaceName]
  );

  const deleteWorkspace = useCallback(
    (workspaceId: string) => {
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(null);
        return true; // Indicar que se eliminó el workspace actual
      }
      return false;
    },
    [currentWorkspace]
  );

  const updateWorkspaceTabs = useCallback(
    (tabs: Tab[]) => {
      if (!currentWorkspace) return;

      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((ws) =>
          ws.id === currentWorkspace.id
            ? {
                ...ws,
                tabs: [...tabs],
                lastModified: new Date().toISOString(),
              }
            : ws
        )
      );
    },
    [currentWorkspace]
  );

  return {
    workspaces,
    currentWorkspace,
    showWorkspaceModal,
    showTemplateModal,
    newWorkspaceName,
    setNewWorkspaceName,
    setShowWorkspaceModal,
    setShowTemplateModal,
    loadWorkspace,
    createNewWorkspace,
    saveCurrentWorkspace,
    deleteWorkspace,
    updateWorkspaceTabs,
  };
};

export default useWorkspaces;
