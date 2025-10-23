import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

/**
 * POST /api/loyalty/transaction
 * Called when a purchase happens at checkout
 * Body: { businessId, loyaltyId, amountSpent }
 */
router.post("/transaction", async (req, res) => {
  console.log("\n=== TRANSACTION (EARN POINTS) ===");
  console.log("Body:", req.body);

  try {
    const { businessId, loyaltyId, amountSpent } = req.body;
    
    if (!businessId || !loyaltyId || amountSpent === undefined) {
      return res.status(400).json({ error: "Missing required fields: businessId, loyaltyId, amountSpent" });
    }

    // Get business conversion rate
    const { data: business, error: bErr } = await supabase
      .from("businesses")
      .select("pointsPerDollar")
      .eq("id", businessId)
      .single();

    if (bErr || !business) {
      console.error("Business not found:", bErr);
      return res.status(404).json({ error: "Business not found" });
    }

    // Calculate points to add
    const pointsToAdd = Math.floor(amountSpent * business.pointsPerDollar);
    console.log(`Adding ${pointsToAdd} points for $${amountSpent} (rate: ${business.pointsPerDollar} pts/$)`);

    // Update customer balance
    const { error: adjErr } = await supabase.rpc("adjust_points", {
      p_business: businessId,
      p_loyalty: loyaltyId,
      p_change: pointsToAdd,
    });

    if (adjErr) {
      console.error("Failed to adjust points:", adjErr);
      return res.status(400).json({ error: adjErr.message });
    }

    // Log transaction
    await supabase.from("transactions").insert({
      businessId,
      loyaltyId,
      type: "earn",
      amountSpent,
      pointsChanged: pointsToAdd,
    });

    console.log(`✅ Transaction complete: +${pointsToAdd} points`);
    res.json({ 
      success: true, 
      pointsAdded: pointsToAdd,
      message: `Earned ${pointsToAdd} points!`
    });

  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/loyalty/redeem
 * Called when customer redeems points for a reward
 * Body: { businessId, loyaltyId, pointsToRedeem }
 */
router.post("/redeem", async (req, res) => {
  console.log("\n=== REDEEM POINTS ===");
  console.log("Body:", req.body);

  try {
    const { businessId, loyaltyId, pointsToRedeem } = req.body;
    
    if (!businessId || !loyaltyId || !pointsToRedeem) {
      return res.status(400).json({ error: "Missing required fields: businessId, loyaltyId, pointsToRedeem" });
    }

    // Check if customer has enough points
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("points")
      .eq("businessId", businessId)
      .eq("loyaltyId", loyaltyId)
      .single();

    if (custErr || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (customer.points < pointsToRedeem) {
      return res.status(400).json({ 
        error: "Insufficient points",
        available: customer.points,
        requested: pointsToRedeem
      });
    }

    // Deduct points
    const negativePoints = -Math.abs(pointsToRedeem);
    const { error: adjErr } = await supabase.rpc("adjust_points", {
      p_business: businessId,
      p_loyalty: loyaltyId,
      p_change: negativePoints,
    });

    if (adjErr) {
      console.error("Failed to redeem points:", adjErr);
      return res.status(400).json({ error: adjErr.message });
    }

    // Log transaction
    await supabase.from("transactions").insert({
      businessId,
      loyaltyId,
      type: "redeem",
      amountSpent: 0,
      pointsChanged: negativePoints,
    });

    console.log(`✅ Redeemed ${pointsToRedeem} points`);
    res.json({ 
      success: true, 
      pointsRedeemed: pointsToRedeem,
      remainingPoints: customer.points + negativePoints,
      message: `Redeemed ${pointsToRedeem} points!`
    });

  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/loyalty/transactions/:businessId/:loyaltyId
 * Get transaction history for a customer
 */
router.get("/transactions/:businessId/:loyaltyId", async (req, res) => {
  try {
    const { businessId, loyaltyId } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("businessId", businessId)
      .eq("loyaltyId", loyaltyId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch transactions:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ transactions: data });
  } catch (err) {
    console.error("Transaction history error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
