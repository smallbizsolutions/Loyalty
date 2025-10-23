// server/routes/dashboard.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

/**
 * GET /api/dashboard/stats/:businessId
 * Get business statistics
 */
router.get("/stats/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get total customers
    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("businessId", businessId);

    // Get total points awarded
    const { data: transactions } = await supabase
      .from("transactions")
      .select("pointsChanged")
      .eq("businessId", businessId);

    const totalPointsAwarded = transactions
      ?.filter(t => t.pointsChanged > 0)
      .reduce((sum, t) => sum + t.pointsChanged, 0) || 0;

    const totalPointsRedeemed = Math.abs(
      transactions
        ?.filter(t => t.pointsChanged < 0)
        .reduce((sum, t) => sum + t.pointsChanged, 0) || 0
    );

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("businessId", businessId)
      .order("createdAt", { ascending: false })
      .limit(10);

    res.json({
      customerCount: customerCount || 0,
      totalPointsAwarded,
      totalPointsRedeemed,
      recentTransactions: recentTransactions || [],
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dashboard/lookup
 * Look up a customer by loyalty ID
 */
router.post("/lookup", async (req, res) => {
  try {
    const { businessId, loyaltyId } = req.body;

    if (!businessId || !loyaltyId) {
      return res.status(400).json({ error: "Missing businessId or loyaltyId" });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .eq("loyaltyId", loyaltyId)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get transaction history
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("businessId", businessId)
      .eq("loyaltyId", loyaltyId)
      .order("createdAt", { ascending: false })
      .limit(20);

    res.json({
      customer,
      transactions: transactions || [],
    });
  } catch (err) {
    console.error("Customer lookup error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
