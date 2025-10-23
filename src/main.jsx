import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/widget.css";

// --- FIX STARTS HERE ---
const urlParams = new URLSearchParams(window.location.search);
let businessId = urlParams.get("businessId");

// If no businessId provided in URL, use a default (your test business)
if (!businessId) {
  businessId = "abc123"; // <-- change this if you want to test another business
  console.warn("No businessId found in URL. Using default:", businessId);
}
// --- FIX ENDS HERE ---

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App businessId={businessId} />
  </React.StrictMode>
);
