// EditorActions.tsx
import React from "react";
import { EyeIcon, PlayIcon, ShareAltIcon, UsersIcon2 } from "../../Icons";

interface TabData {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface EditorActionsProps {
  activeTabData: TabData | undefined;
  togglePreview: () => void;
  executeCode: () => void;
  showCollaborators: boolean;
  toggleCollaborators: () => void;
}

const EditorActions: React.FC<EditorActionsProps> = ({
  activeTabData,
  togglePreview,
  executeCode,
  showCollaborators,
  toggleCollaborators,
}) => {
  if (!activeTabData) return null;

  return (
    <>
      <button
        className="code-editor-action preview-button"
        onClick={togglePreview}
        title="Toggle Preview"
      >
        <EyeIcon />
      </button>
      <button
        className="code-editor-action execute-button"
        onClick={executeCode}
        title="Run code (Ctrl+Enter)"
      >
        <PlayIcon />
      </button>
      <button className="code-editor-action" title="Share">
        <ShareAltIcon />
      </button>
      <button
        className={`code-editor-action ${showCollaborators ? "active" : ""}`}
        onClick={toggleCollaborators}
        title="Collaborate"
      >
        <UsersIcon2 />
      </button>
    </>
  );
};

export default EditorActions;
