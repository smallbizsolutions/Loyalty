// server/routes/dashboard.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

/**
 * GET /api/dashboard/stats/:businessId
 * Get referral statistics
 */
router.get("/stats/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get total customers
    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("businessId", businessId);

    // Get customers by source
    const { data: customers } = await supabase
      .from("customers")
      .select("source, referred_by_phone")
      .eq("businessId", businessId);

    const referralCount = customers?.filter(c => c.source === 'referral').length || 0;
    const directCount = customers?.filter(c => c.source === 'direct').length || 0;
    const socialCount = customers?.filter(c => c.source === 'social').length || 0;
    const otherCount = customers?.filter(c => c.source === 'other').length || 0;

    // Get top referrers
    const { data: topReferrers } = await supabase
      .from("customers")
      .select("phone, referral_count")
      .eq("businessId", businessId)
      .gt("referral_count", 0)
      .order("referral_count", { ascending: false })
      .limit(10);

    // Get recent customers
    const { data: recentCustomers } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .order("createdAt", { ascending: false })
      .limit(10);

    res.json({
      customerCount: customerCount || 0,
      referralCount,
      directCount,
      socialCount,
      otherCount,
      topReferrers: topReferrers || [],
      recentCustomers: recentCustomers || [],
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/dashboard/lookup
 * Look up a customer and their referral history
 */
router.post("/lookup", async (req, res) => {
  try {
    const { businessId, phone } = req.body;

    if (!businessId || !phone) {
      return res.status(400).json({ error: "Missing businessId or phone" });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .eq("phone", cleanPhone)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get who they referred
    const { data: referrals } = await supabase
      .from("customers")
      .select("phone, createdAt, source")
      .eq("businessId", businessId)
      .eq("referred_by_phone", cleanPhone)
      .order("createdAt", { ascending: false });

    // Get who referred them
    let referredByInfo = null;
    if (customer.referred_by_phone) {
      const { data: referrer } = await supabase
        .from("customers")
        .select("phone")
        .eq("businessId", businessId)
        .eq("phone", customer.referred_by_phone)
        .single();
      referredByInfo = referrer;
    }

    res.json({
      customer,
      referrals: referrals || [],
      referredBy: referredByInfo,
    });
  } catch (err) {
    console.error("Customer lookup error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
