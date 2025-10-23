import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Fetch business info (name, theme, etc.)
router.get("/:businessId", async (req, res) => {
  const { businessId } = req.params;
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

export default router;
