import React, { useEffect, useRef } from "react";

interface SandboxProps {
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  language?: string;
  onError?: (error: Error) => void;
}

const Sandbox: React.FC<SandboxProps> = ({
  htmlContent = "",
  cssContent = "",
  jsContent = "",
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let isMounted = true;

    const handleLoad = () => {
      if (!isMounted) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Clear previous content
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>
                body { margin: 0; padding: 10px; font-family: sans-serif; color: #333; }
                #root { display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100%; box-sizing: border-box; }
                ${cssContent}
              </style>
            </head>
            <body>
              <div id="root">${htmlContent || ""}</div>
              <script type="text/babel">
                try {
                  ${jsContent}
                } catch (e) {
                  console.error('JavaScript Error:', e);
                }
              </script>
            </body>
          </html>
        `);
        doc.close();

        window.parent.postMessage(
          { type: "SANDBOX_SUCCESS", output: "Content rendered successfully." },
          "*"
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          onError?.(error);
          window.parent.postMessage(
            {
              type: "SANDBOX_ERROR",
              error: error.message || "Unknown error during setup.",
            },
            "*"
          );
        } else {
          onError?.(new Error("Unknown error during setup."));
          window.parent.postMessage(
            {
              type: "SANDBOX_ERROR",
              error: "Unknown error during setup.",
            },
            "*"
          );
        }
      }
    };

    iframe.addEventListener("load", handleLoad);

    // Initial iframe setup
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `;

    // Cleanup
    return () => {
      isMounted = false;
      iframe.removeEventListener("load", handleLoad);
    };
  }, [htmlContent, cssContent, jsContent, onError]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        backgroundColor: "white",
      }}
      title="code-sandbox"
    />
  );
};

export default Sandbox;
