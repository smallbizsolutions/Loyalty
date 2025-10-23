import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/widget.css";

// Get businessId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let businessId = urlParams.get("businessId");

// If no businessId provided in URL, use your test business ID
if (!businessId) {
  businessId = "abc123"; // Using Test Coffee Co.
  console.warn("No businessId found in URL. Using default:", businessId);
}

console.log("App starting with businessId:", businessId);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App businessId={businessId} />
  </React.StrictMode>
);
