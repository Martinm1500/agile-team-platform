import type { Tab } from "./CodeEditorTypes";

export const WEB_TEMPLATE: Tab[] = [
  {
    id: "1",
    name: "index.html",
    language: "html",
    content:
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Simple Page</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Welcome!</h1>\n    <p>This is a simple HTML page with external CSS.</p>\n    <button onclick="alert(\'Hello from JavaScript!\')">Click me</button>\n  </div>\n</body>\n</html>',
  },
  {
    id: "2",
    name: "styles.css",
    language: "css",
    content:
      "body {\n  font-family: Arial, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background-color: #f0f0f0;\n  margin: 0;\n}\n\n.container {\n  background-color: #ffffff;\n  padding: 30px;\n  border-radius: 8px;\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n  text-align: center;\n}\n\nh1 {\n  color: #333;\n}\n\np {\n  color: #666;\n}\n\nbutton {\n  background-color: #007bff;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 16px;\n  margin-top: 15px;\n}\n\nbutton:hover {\n  background-color: #0056b3;\n}",
  },
  {
    id: "3",
    name: "script.js",
    language: "javascript",
    content:
      "// You can add your JavaScript here\nconsole.log('Hello from script.js!');",
  },
];

export const JAVA_TEMPLATE: Tab[] = [
  {
    id: "1",
    name: "Main.java",
    language: "java",
    content:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  },
];

export const PYTHON_TEMPLATE: Tab[] = [
  {
    id: "1",
    name: "main.py",
    language: "python",
    content: 'print("Hello, World!")',
  },
];

export const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
] as const;
