import { createContext } from "react";

export interface StompContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  registerReconnect: (callback: () => void) => void;
  unregisterReconnect: (callback: () => void) => void;
}

export const StompContext = createContext<StompContextType | undefined>(
  undefined,
);
