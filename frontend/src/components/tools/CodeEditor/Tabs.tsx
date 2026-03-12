import React from "react";
import { PlusIcon } from "../../Icons";

interface Tab {
  id: string;
  name: string;
  language?: string;
  content?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  isRenaming: string | null;
  newName: string;
  onTabChange: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onRenameTab: (tabId: string) => void;
  onConfirmRename: () => void;
  onNewNameChange: (name: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  isRenaming,
  newName,
  onTabChange,
  onAddTab,
  onCloseTab,
  onRenameTab,
  onConfirmRename,
  onNewNameChange,
}) => {
  return (
    <div className="code-editor-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`code-editor-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          onDoubleClick={() => onRenameTab(tab.id)}
          title={tab.name}
        >
          {isRenaming === tab.id ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => onNewNameChange(e.target.value)}
              onBlur={onConfirmRename}
              onKeyDown={(e) => e.key === "Enter" && onConfirmRename()}
              autoFocus
              className="tab-rename-input"
            />
          ) : (
            <span className="tab-name">{tab.name}</span>
          )}
          <span className="tab-close" onClick={(e) => onCloseTab(tab.id, e)}>
            ×
          </span>
        </button>
      ))}
      {tabs.length > 0 && (
        <button
          className="code-editor-tab-add"
          onClick={onAddTab}
          title="New file"
        >
          <PlusIcon />
        </button>
      )}
    </div>
  );
};
