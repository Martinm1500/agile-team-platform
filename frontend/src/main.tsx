// main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import { loader } from "@monaco-editor/react";
import { setupAxiosInterceptors } from "./lib/axios";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

// Configurar interceptores con el store
setupAxiosInterceptors(store);

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
