import React, { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  CodeIcon,
  LightbulbIcon,
  EyeIcon,
  UsersIcon,
  SmileIcon,
} from "../Icons";
import "./MessageInput.css";

interface MessageInputProps {
  onSend: (message: string) => void;
  onWorkModeSelect?: (mode: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onWorkModeSelect,
}) => {
  const [message, setMessage] = useState("");
  const [showWorkModes, setShowWorkModes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const workModes = [
    { id: "pair", icon: <CodeIcon />, label: "Pair Programming" },
    { id: "brainstorm", icon: <LightbulbIcon />, label: "Brainstorm" },
    { id: "review", icon: <EyeIcon />, label: "Code Review" },
    { id: "meeting", icon: <UsersIcon />, label: "Quick Meeting" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowWorkModes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (message.trim() !== "") {
        onSend(message);
        setMessage("");
      }
    }
  };

  const handleWorkModeClick = (mode: string) => {
    setShowWorkModes(false);
    if (onWorkModeSelect) onWorkModeSelect(mode);
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <button
          ref={buttonRef}
          className="left-icon"
          tabIndex={0}
          onClick={() => setShowWorkModes(!showWorkModes)}
        >
          <PlusIcon />
        </button>

        {showWorkModes && (
          <div className="work-modes-dropdown" ref={dropdownRef}>
            {workModes.map((mode) => (
              <button
                key={mode.id}
                className="work-mode-option"
                onClick={() => handleWorkModeClick(mode.id)}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        )}

        <textarea
          className="message-input"
          placeholder="Message"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="message-input-icons">
          <PlusIcon className="message-input-icon" />
          <SmileIcon className="message-input-icon" />
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
