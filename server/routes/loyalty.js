// server/routes/loyalty.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Create a new anonymous customer
router.post("/create", async (req, res) => {
  console.log("\n=== CREATE LOYALTY ID REQUEST ===");
  console.log("Body:", req.body);
  
  try {
    const { businessId } = req.body;
    
    if (!businessId) {
      console.log("❌ Missing businessId");
      return res.status(400).json({ error: "Missing businessId" });
    }

    const loyaltyId = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated loyalty ID:", loyaltyId);

    // First, check if businesses table exists and has this businessId
    const { data: businessCheck, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .single();

    if (businessError) {
      console.log("❌ Business not found:", businessError);
      return res.status(404).json({ 
        error: "Business not found",
        details: businessError.message 
      });
    }

    console.log("✅ Business exists:", businessCheck);

    // Insert customer with camelCase column names
    const { data, error } = await supabase
      .from("customers")
      .insert({ 
        businessId: businessId,
        loyaltyId: loyaltyId,
        points: 0 
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(400).json({ 
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    console.log("✅ Successfully created customer:", data);
    res.json({ loyaltyId });
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ 
      error: "Server error",
      message: err.message
    });
  }
});

// Check customer points
router.post("/check", async (req, res) => {
  console.log("\n=== CHECK POINTS REQUEST ===");
  console.log("Body:", req.body);
  
  try {
    const { businessId, loyaltyId } = req.body;
    
    if (!businessId || !loyaltyId) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "Missing businessId or loyaltyId" });
    }

    const { data, error } = await supabase
      .from("customers")
      .select("points")
      .eq("businessId", businessId)
      .eq("loyaltyId", loyaltyId)
      .single();

    if (error) {
      console.error("❌ Supabase query error:", error);
      return res.status(400).json({ 
        error: error.message,
        code: error.code
      });
    }
    
    if (!data) {
      console.log("❌ Customer not found");
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log("✅ Found customer with points:", data.points);
    res.json({ points: data.points });
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ 
      error: "Server error",
      message: err.message 
    });
  }
});

export default router;
