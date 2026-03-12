import React, { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useMonaco } from "./useMonaco";
import "./CodeEditor.css";
import useTabs from "./useTabs";
import useWorkspaces from "./useWorkspaces";
import useDropdown from "./useDropdown";
import { Tabs } from "./Tabs";
import { WorkspaceSelector } from "./WorkspaceSelector";
import WorkspaceModals from "./WorkspaceModals";
import { LanguageSelector } from "./LanguageSelector";
import PreviewPanel from "./PreviewPanel";
import StatusBar from "./StatusBar";
import CollaboratorsPanel from "./ColaboratorsPanel";
import NoFilePanel from "./NoFilePanel";
import EditorActions from "./EditorActions";
import usePreviewPanel from "./usePreviewPanel";

const CodeEditor: React.FC = () => {
  // Gestión de workspaces
  const {
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
  } = useWorkspaces();

  // Gestión de pestañas
  const {
    tabs,
    activeTab,
    isRenaming,
    newName,
    handleTabChange,
    addNewTab,
    closeTab,
    renameTab,
    confirmRename,
    setTabs,
    setNewName,
    setActiveTab,
  } = useTabs([]);

  // Dropdowns/paneles
  const { close: closeLanguageDropdown } = useDropdown();

  const {
    isOpen: showWorkspaceDropdown,
    ref: workspaceDropdownRef,
    toggle: toggleWorkspaceDropdown,
  } = useDropdown();

  const {
    isOpen: showPreview,
    ref: previewPanelRef,
    toggle: togglePreview,
    close: closePreview,
  } = usePreviewPanel();

  const {
    isOpen: showCollaborators,
    ref: collaboratorsPanelRef,
    toggle: toggleCollaborators,
    close: closeCollaborators,
  } = useDropdown();

  // Estado de ejecución
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Hook de Monaco
  const executeCode = useCallback(() => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    if (!activeTabData) return;

    if (
      !["javascript", "typescript", "html"].includes(activeTabData.language)
    ) {
      setExecutionOutput(null);
      setExecutionError(
        "Preview/Execution is only available for HTML, JavaScript, and TypeScript."
      );
      togglePreview();
      return;
    }

    setExecutionOutput("Ejecutando código...");
    setExecutionError(null);
    togglePreview();
  }, [activeTab, tabs, togglePreview]);

  const { cursorPosition, handleEditorMount } = useMonaco(executeCode);

  // Manejadores de pestañas
  const handleAddNewTab = useCallback(() => {
    const newTab = addNewTab();
    if (currentWorkspace) {
      updateWorkspaceTabs([...tabs, newTab]);
    }
  }, [addNewTab, currentWorkspace, tabs, updateWorkspaceTabs]);

  const handleCloseTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      closeTab(tabId);

      if (currentWorkspace) {
        updateWorkspaceTabs(tabs.filter((tab) => tab.id !== tabId));
      }
    },
    [closeTab, currentWorkspace, tabs, updateWorkspaceTabs]
  );

  const handleConfirmRename = useCallback(() => {
    confirmRename();

    if (isRenaming && newName.trim() && currentWorkspace) {
      updateWorkspaceTabs(
        tabs.map((tab) =>
          tab.id === isRenaming ? { ...tab, name: newName.trim() } : tab
        )
      );
    }
  }, [
    confirmRename,
    isRenaming,
    newName,
    currentWorkspace,
    tabs,
    updateWorkspaceTabs,
  ]);

  // Cambio de lenguaje
  const changeLanguage = useCallback(
    (language: string) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab ? { ...tab, language } : tab
        )
      );
      if (currentWorkspace) {
        updateWorkspaceTabs(
          tabs.map((tab) => (tab.id === activeTab ? { ...tab, language } : tab))
        );
      }
      closeLanguageDropdown();
    },
    [
      activeTab,
      currentWorkspace,
      setTabs,
      tabs,
      updateWorkspaceTabs,
      closeLanguageDropdown,
    ]
  );

  // Manejadores del editor
  const handleSandboxError = useCallback((error: Error) => {
    setExecutionError(error.message);
    setExecutionOutput(null);
  }, []);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab ? { ...tab, content: value || "" } : tab
        )
      );
      if (currentWorkspace) {
        updateWorkspaceTabs(
          tabs.map((tab) =>
            tab.id === activeTab ? { ...tab, content: value || "" } : tab
          )
        );
      }
    },
    [activeTab, currentWorkspace, setTabs, tabs, updateWorkspaceTabs]
  );

  // Efectos
  useEffect(() => {
    if (currentWorkspace) {
      setTabs([...currentWorkspace.tabs]);
      setActiveTab(currentWorkspace.tabs[0]?.id || "");
    } else {
      setTabs([]);
      setActiveTab("");
    }
  }, [currentWorkspace, setTabs, setActiveTab]);

  // Datos derivados
  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const lineCount = activeTabData?.content.split("\n").length || 1;

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          isRenaming={isRenaming}
          newName={newName}
          onTabChange={handleTabChange}
          onAddTab={handleAddNewTab}
          onCloseTab={handleCloseTab}
          onRenameTab={renameTab}
          onConfirmRename={handleConfirmRename}
          onNewNameChange={setNewName}
        />
        <div className="code-editor-actions">
          <WorkspaceSelector
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            createNewWorkspace={createNewWorkspace}
            loadWorkspace={loadWorkspace}
            deleteWorkspace={deleteWorkspace}
            showWorkspaceDropdown={showWorkspaceDropdown}
            workspaceDropdownRef={workspaceDropdownRef}
            toggleWorkspaceDropdown={toggleWorkspaceDropdown}
          />
          {activeTabData && (
            <LanguageSelector
              currentLanguage={activeTabData.language}
              onChange={changeLanguage}
            />
          )}
          <EditorActions
            activeTabData={activeTabData}
            togglePreview={togglePreview}
            executeCode={executeCode}
            showCollaborators={showCollaborators}
            toggleCollaborators={toggleCollaborators}
          />
        </div>
      </div>

      <div className="editor-preview-container">
        {activeTabData ? (
          <div className="code-editor-content-wrapper">
            <Editor
              height="100%"
              language={activeTabData.language}
              theme="vs-dark"
              value={activeTabData.content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        ) : (
          <NoFilePanel
            workspaces={workspaces}
            createNewWorkspace={createNewWorkspace}
            loadWorkspace={loadWorkspace}
            deleteWorkspace={deleteWorkspace}
          />
        )}

        <PreviewPanel
          tabs={tabs}
          showPreview={showPreview}
          previewPanelRef={previewPanelRef}
          closePreview={closePreview}
          executionError={executionError}
          executionOutput={executionOutput}
          handleSandboxError={handleSandboxError}
        />
      </div>

      <WorkspaceModals
        showWorkspaceModal={showWorkspaceModal}
        showTemplateModal={showTemplateModal}
        newWorkspaceName={newWorkspaceName}
        setNewWorkspaceName={setNewWorkspaceName}
        setShowWorkspaceModal={setShowWorkspaceModal}
        setShowTemplateModal={setShowTemplateModal}
        saveCurrentWorkspace={saveCurrentWorkspace}
      />

      {activeTabData && (
        <StatusBar cursorPosition={cursorPosition} lineCount={lineCount} />
      )}

      <CollaboratorsPanel
        showCollaborators={showCollaborators}
        collaboratorsPanelRef={collaboratorsPanelRef}
        closeCollaborators={closeCollaborators}
      />
    </div>
  );
};

export default CodeEditor;
