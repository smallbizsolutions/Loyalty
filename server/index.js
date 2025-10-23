import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import businessRoutes from "./routes/business.js";
import loyaltyRoutes from "./routes/loyalty.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/business", businessRoutes);
app.use("/api/loyalty", loyaltyRoutes);

// Serve static files from the dist directory (Vite build output)
app.use(express.static(path.join(__dirname, "../dist")));

// Handle React routing, return index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
