export interface CodeUpdate {
  filename: string;
  content: string;
  language: string;
}

export interface AppState {
  isRecording: boolean;
  isConnected: boolean;
  transcript: string;
  code: string;
  currentFile: string;
  lastUpdate: number;
}
