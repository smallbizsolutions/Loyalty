import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/widget.css";

const urlParams = new URLSearchParams(window.location.search);
const businessId = urlParams.get("businessId");

ReactDOM.createRoot(document.getElementById("root")).render(
  <App businessId={businessId} />
);
