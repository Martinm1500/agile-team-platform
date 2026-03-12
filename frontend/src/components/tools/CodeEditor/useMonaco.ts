import { useState, useRef, useCallback } from "react";
import type { OnMount } from "@monaco-editor/react";
import type {
  Position,
  IStandaloneCodeEditor,
  ICursorPositionChangedEvent,
} from "./CodeEditorTypes";
import * as monaco from "monaco-editor";

export const useMonaco = (onExecuteCode: () => void) => {
  const [cursorPosition, setCursorPosition] = useState<Position>({
    line: 1,
    column: 1,
  });

  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      // Configuración de eventos
      editor.onDidChangeCursorPosition((e: ICursorPositionChangedEvent) => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });

      // Atajo de teclado (Ctrl+Enter)
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
        onExecuteCode()
      );

      // Configuración inicial del editor
      editor.focus();
      editor.updateOptions({
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        quickSuggestions: true,
      });
    },
    [onExecuteCode]
  );

  return {
    cursorPosition,
    editorRef,
    handleEditorMount,
    setCursorPosition,
  };
};
