import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import "./styles/widget.css";

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const businessId = urlParams.get("businessId") || "abc123";
const isDashboard = window.location.pathname.includes("/dashboard");

console.log("App starting with businessId:", businessId);
console.log("Mode:", isDashboard ? "Dashboard" : "Customer Widget");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isDashboard ? (
      <Dashboard businessId={businessId} />
    ) : (
      <App businessId={businessId} />
    )}
  </React.StrictMode>
);
