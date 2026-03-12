import { useContext } from "react";
import { StompContext } from "./StompContext";

import type { StompContextType } from "./StompContext";

export const useStomp = (): StompContextType => {
  const context = useContext(StompContext);
  if (context === undefined) {
    throw new Error("useStomp must be used within a StompProvider");
  }
  return context;
};
