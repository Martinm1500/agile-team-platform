// CollaboratorsPanel.tsx
import React from "react";
import { TimesIcon } from "../../Icons";

interface CollaboratorsPanelProps {
  showCollaborators: boolean;
  collaboratorsPanelRef: React.RefObject<HTMLDivElement | null>;
  closeCollaborators: () => void;
}

const CollaboratorsPanel: React.FC<CollaboratorsPanelProps> = ({
  showCollaborators,
  collaboratorsPanelRef,
  closeCollaborators,
}) => {
  if (!showCollaborators) return null;

  return (
    <div className="collaborators-panel" ref={collaboratorsPanelRef}>
      <div className="collaborators-header">
        <h3>Collaborators</h3>
        <button onClick={closeCollaborators}>
          <TimesIcon />
        </button>
      </div>
      <div className="collaborator">
        <span className="user-avatar">Y</span>
        <div className="user-info">
          <span className="user-name">You (Host)</span>
          <span className="user-status">Editing</span>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsPanel;
