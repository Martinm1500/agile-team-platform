// NoFilePanel.tsx
import React from "react";
import type { Workspace } from "./CodeEditorTypes";

interface NoFilePanelProps {
  workspaces: Workspace[];
  createNewWorkspace: () => void;
  loadWorkspace: (workspace: Workspace) => void;
  deleteWorkspace: (id: string) => void;
}

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6H5H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoFilePanel: React.FC<NoFilePanelProps> = ({
  workspaces,
  createNewWorkspace,
  loadWorkspace,
  deleteWorkspace,
}) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    deleteWorkspace(id);
  };

  return (
    <div className="no-file-panel" role="region" aria-label="Workspace manager">
      <div className="actions-section">
        <div className="welcome-editor">
          <h2>¡Bienvenido al editor de CodeCollab!</h2>
          <p>
            Acá podés crear y editar proyectos directamente desde el navegador.
            Escribí, ejecutá y colaborá en tiempo real con tu equipo.
          </p>

          <p className="section-title">¿Qué querés hacer ahora?</p>

          <ul className="welcome-options">
            <li
              className="welcome-option create"
              onClick={createNewWorkspace}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && createNewWorkspace()
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#40C057"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="#40C057"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Crear nuevo Workspace
            </li>
            <li className="welcome-option open-file">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                  stroke="#228BE6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Abrir un proyecto existente
            </li>
            <li className="welcome-option resume">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="#FAB005"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Reanudar el último proyecto
            </li>
            <li className="welcome-option start-pair-programming">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                  stroke="#E64980"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Iniciar sesión de pair programming
            </li>
          </ul>

          <div className="welcome-note">
            <p>
              <strong>Pair programming:</strong> En una sesión de
              pair-programming, vas a compartir tu editor con otra persona.
              Ambos podrán ver y editar el código en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {workspaces.length > 0 && (
        <div className="workspaces-section">
          <section
            className="saved-workspaces"
            aria-labelledby="saved-workspaces-heading"
          >
            <h3 id="saved-workspaces-heading">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              >
                <path
                  d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Workspaces recientes
            </h3>
            <ul className="workspaces-list" role="list">
              {workspaces.map((workspace) => (
                <li
                  key={workspace.id}
                  className="workspace-option"
                  onClick={() => loadWorkspace(workspace)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Load workspace ${workspace.name}`}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    loadWorkspace(workspace)
                  }
                >
                  <span className="workspace-name">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ marginRight: "8px" }}
                    >
                      <path
                        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {workspace.name}
                  </span>
                  <button
                    className="workspace-delete"
                    onClick={(e) => handleDelete(e, workspace.id)}
                    aria-label={`Delete workspace ${workspace.name}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default NoFilePanel;
