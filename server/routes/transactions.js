import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

/**
 * POST /api/loyalty/transaction
 * Called automatically when a purchase happens.
 * body: { businessId, loyaltyId, amountSpent }
 */
router.post("/transaction", async (req, res) => {
  const { businessId, loyaltyId, amountSpent } = req.body;
  if (!businessId || !loyaltyId || !amountSpent)
    return res.status(400).json({ error: "Missing required fields" });

  // Get conversion rule for this business
  const { data: business, error: bErr } = await supabase
    .from("businesses")
    .select("points_per_dollar")
    .eq("id", businessId)
    .single();

  if (bErr || !business) return res.status(400).json({ error: "Business not found" });

  // Calculate points to add
  const pointsToAdd = Math.floor(amountSpent * business.points_per_dollar);

  // Update customer balance
  const { error: adjErr } = await supabase.rpc("adjust_points", {
    p_business: businessId,
    p_loyalty: loyaltyId,
    p_change: pointsToAdd,
  });

  if (adjErr) return res.status(400).json({ error: adjErr.message });

  // Log transaction
  await supabase.from("transactions").insert([
    {
      businessId,
      loyaltyId,
      type: "earn",
      amountSpent,
      pointsChanged: pointsToAdd,
    },
  ]);

  res.json({ success: true, pointsAdded: pointsToAdd });
});

/**
 * POST /api/loyalty/redeem
 * Called automatically when customer redeems points for reward.
 * body: { businessId, loyaltyId, pointsUsed }
 */
router.post("/redeem", async (req, res) => {
  const { businessId, loyaltyId, pointsUsed } = req.body;
  if (!businessId || !loyaltyId || !pointsUsed)
    return res.status(400).json({ error: "Missing required fields" });

  const negativePoints = -Math.abs(pointsUsed);

  const { error: adjErr } = await supabase.rpc("adjust_points", {
    p_business: businessId,
    p_loyalty: loyaltyId,
    p_change: negativePoints,
  });

  if (adjErr) return res.status(400).json({ error: adjErr.message });

  await supabase.from("transactions").insert([
    {
      businessId,
      loyaltyId,
      type: "redeem",
      amountSpent: 0,
      pointsChanged: negativePoints,
    },
  ]);

  res.json({ success: true, pointsDeducted: pointsUsed });
});

export default router;
