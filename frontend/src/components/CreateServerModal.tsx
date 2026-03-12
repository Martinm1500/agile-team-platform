import React, { useState } from "react";

import "./CreateServerModal.css";

interface CreateServerModalProps {
  onClose: () => void;
  onCreateServer: (newServer: { name: string }) => void;
  isCreating?: boolean;
}

const CreateServerModal: React.FC<CreateServerModalProps> = ({
  onClose,
  onCreateServer,
  isCreating = false,
}) => {
  const [serverName, setServerName] = useState("");

  const handleCreate = () => {
    if (!serverName.trim() || isCreating) return;

    onCreateServer({
      name: serverName,
    });
  };

  return (
    <div className="create-server-modal-overlay">
      <div className="create-server-modal">
        <h2 className="create-server-modal__title">Create New Server</h2>

        <div className="create-server-modal__input-group">
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Server name"
            className="create-server-modal__input"
            autoFocus
            disabled={isCreating}
          />
        </div>

        <div className="create-server-modal__actions">
          <button
            className="create-server-modal__button create-server-modal__button--cancel"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            className="create-server-modal__button create-server-modal__button--create"
            onClick={handleCreate}
            disabled={!serverName.trim() || isCreating}
          >
            {isCreating ? "Creando..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateServerModal);
