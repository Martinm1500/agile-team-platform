import React from "react";
import Sandbox from "./Sandbox";
import { TimesIcon, CodeIcon } from "../../Icons";
import type { Tab } from "./CodeEditorTypes";

interface PreviewPanelProps {
  tabs: Tab[];
  showPreview: boolean;
  previewPanelRef: React.RefObject<HTMLDivElement | null>;
  closePreview: () => void;
  executionError: string | null;
  executionOutput: string | null;
  handleSandboxError: (error: Error) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  tabs,
  showPreview,
  previewPanelRef,
  closePreview,
  handleSandboxError,
}) => {
  if (!showPreview) return null;

  // Extraer contenidos de todas las pestañas relevantes
  const htmlContent =
    tabs.find((tab) => tab.name.endsWith(".html"))?.content || "";
  const cssContent =
    tabs.find((tab) => tab.name.endsWith(".css"))?.content || "";
  const jsContent =
    tabs.find(
      (tab) =>
        tab.name.endsWith(".js") ||
        tab.name.endsWith(".ts") ||
        tab.language === "javascript" ||
        tab.language === "typescript"
    )?.content || "";

  const hasContent = htmlContent || cssContent || jsContent;

  return (
    <div className="preview-panel" ref={previewPanelRef}>
      <div className="preview-header">
        <h3>Preview</h3>
        <button onClick={closePreview}>
          <TimesIcon />
        </button>
      </div>
      <div className="preview-content">
        {hasContent ? (
          <Sandbox
            htmlContent={htmlContent}
            cssContent={cssContent}
            jsContent={jsContent}
            onError={handleSandboxError}
          />
        ) : (
          <div className="preview-message">
            <CodeIcon />
            <p>No previewable content found in this project.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
