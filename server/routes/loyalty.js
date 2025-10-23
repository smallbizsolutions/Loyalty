// server/routes/loyalty.js
import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Register new customer or return existing
router.post("/register", async (req, res) => {
  console.log("\n=== REGISTER CUSTOMER ===");
  console.log("Body:", req.body);
  
  try {
    const { businessId, phone, referredBy, source } = req.body;
    
    if (!businessId || !phone) {
      return res.status(400).json({ error: "Missing businessId or phone" });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanReferrer = referredBy ? referredBy.replace(/\D/g, '') : null;
    
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Check if customer already exists
    const { data: existing, error: checkError } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Database error:", checkError);
      return res.status(400).json({ error: checkError.message });
    }

    if (existing) {
      console.log("✅ Existing customer:", existing);
      return res.json({ 
        phone: cleanPhone,
        referralCount: existing.referral_count || 0,
        isNew: false
      });
    }

    // Validate referrer exists if provided
    if (cleanReferrer) {
      const { data: referrer } = await supabase
        .from("customers")
        .select("phone")
        .eq("businessId", businessId)
        .eq("phone", cleanReferrer)
        .single();

      if (!referrer) {
        return res.status(400).json({ error: "Referrer not found" });
      }
    }

    // Create new customer
    const { data: newCustomer, error: insertError } = await supabase
      .from("customers")
      .insert({ 
        businessId,
        phone: cleanPhone,
        referred_by_phone: cleanReferrer,
        source: source || (cleanReferrer ? 'referral' : 'direct'),
        points: 0,
        referral_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    console.log("✅ New customer created:", newCustomer);
    
    res.json({ 
      phone: cleanPhone,
      referralCount: 0,
      isNew: true,
      wasReferred: !!cleanReferrer
    });
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer info including referral stats
router.post("/check", async (req, res) => {
  console.log("\n=== CHECK CUSTOMER ===");
  
  try {
    const { businessId, phone } = req.body;
    
    if (!businessId || !phone) {
      return res.status(400).json({ error: "Missing businessId or phone" });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("businessId", businessId)
      .eq("phone", cleanPhone)
      .single();

    if (error) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get list of people they referred
    const { data: referrals } = await supabase
      .from("customers")
      .select("phone, createdAt")
      .eq("businessId", businessId)
      .eq("referred_by_phone", cleanPhone)
      .order("createdAt", { ascending: false });

    res.json({ 
      phone: data.phone,
      referralCount: data.referral_count || 0,
      referrals: referrals || [],
      source: data.source
    });
    
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all customers for a business (for referral source dropdown)
router.get("/customers/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    const { data, error } = await supabase
      .from("customers")
      .select("phone, createdAt")
      .eq("businessId", businessId)
      .order("createdAt", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ customers: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
