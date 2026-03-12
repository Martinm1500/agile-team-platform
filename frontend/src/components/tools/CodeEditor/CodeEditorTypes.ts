export interface Tab {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface Position {
  line: number;
  column: number;
}

export interface Workspace {
  id: string;
  name: string;
  tabs: Tab[];
  lastModified: string;
}

export interface IStandaloneCodeEditor {
  onDidChangeCursorPosition: (
    listener: (e: ICursorPositionChangedEvent) => void
  ) => void;
  dispose: () => void;
}

export interface ICursorPositionChangedEvent {
  position: {
    lineNumber: number;
    column: number;
  };
}

export type MonacoEditor = IStandaloneCodeEditor;
