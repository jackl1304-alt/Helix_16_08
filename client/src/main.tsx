import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Alternative Mounting-Strategie bei WebSocket-Problemen
console.log("🚀 Helix Frontend starting...");

// Direkte DOM-Ready-Prüfung
function initializeHelix() {
  console.log("Checking DOM ready state:", document.readyState);
  
  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);
  
  if (!rootElement) {
    console.error("❌ Root element not found! Retrying in 100ms...");
    setTimeout(initializeHelix, 100);
    return;
  }
  
  try {
    console.log("✅ Creating React root...");
    const root = createRoot(rootElement);
    console.log("✅ Rendering App component...");
    root.render(<App />);
    console.log("✅ Helix Frontend mounted successfully!");
  } catch (error) {
    console.error("❌ Error mounting Helix Frontend:", error);
    console.error("Retrying in 500ms...");
    setTimeout(initializeHelix, 500);
  }
}

// Multiple init strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHelix);
} else {
  initializeHelix();
}

// Fallback init nach 1 Sekunde
setTimeout(() => {
  if (!document.querySelector('#root > *')) {
    console.log("🔄 Fallback initialization...");
    initializeHelix();
  }
}, 1000);
