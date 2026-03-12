// usePreviewPanel.ts
import { useState, useRef } from "react";

const usePreviewPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    ref,
    toggle,
    close,
  };
};

export default usePreviewPanel;
