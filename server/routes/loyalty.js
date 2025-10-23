import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Generate new anonymous loyalty ID
router.post("/create", async (req, res) => {
  const { businessId } = req.body;
  const loyaltyId = Math.floor(100000 + Math.random() * 900000).toString();
  const { data, error } = await supabase
    .from("customers")
    .insert([{ businessId, loyaltyId, points: 0 }])
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Get points by loyalty ID
router.post("/check", async (req, res) => {
  const { businessId, loyaltyId } = req.body;
  const { data, error } = await supabase
    .from("customers")
    .select("points")
    .eq("businessId", businessId)
    .eq("loyaltyId", loyaltyId)
    .single();

  if (error) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

export default router;
