// server/routes/loyalty.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Create a new anonymous customer
router.post("/create", async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: "Missing businessId" });

  const loyaltyId = Math.floor(100000 + Math.random() * 900000).toString();

  const { error } = await supabase
    .from("customers")
    .insert([{ businessId, loyaltyId, points: 0 }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ loyaltyId });
});

// Check customer points
router.post("/check", async (req, res) => {
  const { businessId, loyaltyId } = req.body;
  if (!businessId || !loyaltyId)
    return res.status(400).json({ error: "Missing fields" });

  const { data, error } = await supabase
    .from("customers")
    .select("points")
    .eq("businessId", businessId)
    .eq("loyaltyId", loyaltyId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Customer not found" });

  res.json({ points: data.points });
});

export default router;
