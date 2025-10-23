// server/routes/transactions.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

/**
 * POST /api/loyalty/reward
 * Give a reward/bonus to a customer for referrals
 */
router.post("/reward", async (req, res) => {
  console.log("\n=== GIVE REWARD ===");
  
  try {
    const { businessId, phone, rewardAmount, note } = req.body;
    
    if (!businessId || !phone || !rewardAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Verify customer exists
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .eq("phone", cleanPhone)
      .single();

    if (custErr || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Log the reward
    await supabase.from("transactions").insert({
      businessId,
      phone: cleanPhone,
      type: "reward",
      amountSpent: 0,
      pointsChanged: 0,
      referral_bonus: rewardAmount,
    });

    res.json({ 
      success: true,
      message: `Rewarded $${rewardAmount} for referrals!`
    });

  } catch (err) {
    console.error("Reward error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/loyalty/transactions/:businessId/:phone
 * Get reward history
 */
router.get("/transactions/:businessId/:phone", async (req, res) => {
  try {
    const { businessId, phone } = req.params;
    const cleanPhone = phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("businessId", businessId)
      .eq("phone", cleanPhone)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ transactions: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
