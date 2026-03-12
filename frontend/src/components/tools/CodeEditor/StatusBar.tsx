// StatusBar.tsx
import React from "react";

interface StatusBarProps {
  cursorPosition: { line: number; column: number };
  lineCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ cursorPosition, lineCount }) => {
  return (
    <div className="status-bar">
      <div className="position-indicator">
        Ln {cursorPosition.line}, Col {cursorPosition.column}
      </div>
      <div className="line-count">
        {lineCount} {lineCount === 1 ? "line" : "lines"}
      </div>
    </div>
  );
};

export default StatusBar;
