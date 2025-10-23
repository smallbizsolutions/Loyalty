import express from "express";
import cors from "cors";
import businessRoutes from "./routes/business.js";
import loyaltyRoutes from "./routes/loyalty.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/business", businessRoutes);
app.use("/api/loyalty", loyaltyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
