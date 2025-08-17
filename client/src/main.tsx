import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging für React mounting
console.log("🚀 Helix Frontend starting...");
console.log("Root element:", document.getElementById("root"));

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("❌ Root element not found!");
    throw new Error("Root element not found");
  }
  
  console.log("✅ Creating React root...");
  const root = createRoot(rootElement);
  console.log("✅ Rendering App component...");
  root.render(<App />);
  console.log("✅ Helix Frontend mounted successfully!");
} catch (error) {
  console.error("❌ Error mounting Helix Frontend:", error);
}
