import React from "react";
import { SiHtml5, SiPython } from "react-icons/si";
import { JavaIcon } from "../../Icons";

interface WorkspaceModalsProps {
  showWorkspaceModal: boolean;
  showTemplateModal: boolean;
  newWorkspaceName: string;
  setNewWorkspaceName: (name: string) => void;
  setShowWorkspaceModal: (show: boolean) => void;
  setShowTemplateModal: (show: boolean) => void;
  saveCurrentWorkspace: (template: string) => void;
}

const WorkspaceModals: React.FC<WorkspaceModalsProps> = ({
  showWorkspaceModal,
  showTemplateModal,
  newWorkspaceName,
  setNewWorkspaceName,
  setShowWorkspaceModal,
  setShowTemplateModal,
  saveCurrentWorkspace,
}) => {
  const handleNext = () => {
    if (newWorkspaceName.trim()) {
      setShowWorkspaceModal(false);
      setShowTemplateModal(true);
    }
  };

  const handleBack = () => {
    setShowTemplateModal(false);
    setShowWorkspaceModal(true);
  };

  return (
    <>
      {showWorkspaceModal && (
        <div className="modal-overlay">
          <div className="workspace-modal">
            <h3>Create New Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowWorkspaceModal(false)}
              >
                Cancel
              </button>
              <button
                className="next-button"
                onClick={handleNext}
                disabled={!newWorkspaceName.trim()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="template-modal">
            <h3>Choose Template</h3>
            <div className="template-options">
              <div
                className="template-option"
                onClick={() => saveCurrentWorkspace("web")}
              >
                <SiHtml5
                  style={{ width: "100px", height: "100px", color: "#e44d26" }}
                />
                <h4>Web Template</h4>
                <p>HTML, CSS, and JavaScript files</p>
              </div>
              <div
                className="template-option"
                onClick={() => saveCurrentWorkspace("java")}
              >
                <JavaIcon />
                <h4>Java Template</h4>
                <p>Simple Java main class</p>
              </div>
              <div
                className="template-option"
                onClick={() => saveCurrentWorkspace("python")}
              >
                <SiPython
                  style={{ width: "100px", height: "100px", color: "#3b82f6" }}
                />
                <h4>Python Template</h4>
                <p>Simple Python script</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={handleBack}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceModals;
