export interface SmartNotesWorkspace {
  id: number;
  title: string;
  created: string;
  notes: (Note | EmptyNote | IndicatorNote)[];
}

export interface Note {
  id: number;
  title: string;
  type: string;
  content: string;
  summary: string;
  tags: string[];
  sourceLinks: string[];
  insights: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  noteColor: string;
  visibility: string;
}

export interface EmptyNote {
  id: number;
  type: "empty";
}

export interface IndicatorNote {
  id: number;
  type: "indicator";
}

export type DisplayNote = Note | EmptyNote | IndicatorNote;
