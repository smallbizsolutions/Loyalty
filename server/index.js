// server/index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import businessRoutes from "./routes/business.js";
import loyaltyRoutes from "./routes/loyalty.js";
import transactionRoutes from "./routes/transactions.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    env: {
      supabaseUrl: process.env.SUPABASE_URL ? "set" : "missing",
      supabaseKey: process.env.SUPABASE_ANON_KEY ? "set" : "missing"
    }
  });
});

// --- API Routes ---
app.use("/api/business", businessRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/loyalty", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --- Serve Frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

// Check if dist folder exists
import { existsSync } from 'fs';
if (existsSync(distPath)) {
  console.log("✅ Serving static files from:", distPath);
  app.use(express.static(distPath));
  app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  console.warn("⚠️  dist folder not found. Frontend will not be served.");
  app.get("*", (_, res) => res.json({ message: "API is running. Frontend not built yet." }));
}

// --- Start Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment check:`, {
    SUPABASE_URL: process.env.SUPABASE_URL ? "✓ Set" : "✗ Missing",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"
  });
});
