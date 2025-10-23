import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import businessRoutes from "./routes/business.js";
import loyaltyRoutes from "./routes/loyalty.js";
import transactionRoutes from "./routes/transactions.js"; // NEW

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/business", businessRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/loyalty", transactionRoutes); // transaction + redeem endpoints

// --- Serve Frontend (Vite Build) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

// Fallback route for React (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
