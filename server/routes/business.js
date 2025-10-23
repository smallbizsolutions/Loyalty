import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Fetch business info (name, theme, etc.)
router.get("/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    
    console.log("Fetching business:", businessId);
    
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();
    
    if (error) {
      console.error("Business fetch error:", error);
      return res.status(400).json({ error: error.message });
    }
    
    if (!data) {
      console.error("Business not found:", businessId);
      return res.status(404).json({ error: "Business not found" });
    }
    
    console.log("Found business:", data);
    res.json(data);
  } catch (err) {
    console.error("Business route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
