// WorkspaceSelector.tsx
import { CaretDownIcon, PlusIcon, TrashIcon } from "../../Icons";
import type { Workspace } from "./CodeEditorTypes";

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  createNewWorkspace: () => void;
  loadWorkspace: (workspace: Workspace) => void;
  deleteWorkspace: (id: string) => void;
  showWorkspaceDropdown: boolean;
  workspaceDropdownRef: React.RefObject<HTMLDivElement | null>;
  toggleWorkspaceDropdown: () => void;
}

export const WorkspaceSelector = ({
  workspaces,
  currentWorkspace,
  createNewWorkspace,
  loadWorkspace,
  deleteWorkspace,
  showWorkspaceDropdown,
  workspaceDropdownRef,
  toggleWorkspaceDropdown,
}: WorkspaceSelectorProps) => (
  <div className="workspace-selector">
    <button className="workspace-button" onClick={toggleWorkspaceDropdown}>
      {currentWorkspace?.name || "Select Workspace"}
      <CaretDownIcon />
    </button>
    {showWorkspaceDropdown && (
      <div className="workspace-dropdown" ref={workspaceDropdownRef}>
        <div
          className="workspace-option create-new"
          onClick={createNewWorkspace}
        >
          <PlusIcon /> Create New Workspace
        </div>
        {workspaces.length === 0 && (
          <div className="workspace-empty-message">No saved workspaces yet</div>
        )}
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="workspace-option"
            onClick={() => loadWorkspace(workspace)}
          >
            <span className="workspace-name">{workspace.name}</span>
            <span
              className="workspace-delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteWorkspace(workspace.id);
              }}
            >
              <TrashIcon />
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);
