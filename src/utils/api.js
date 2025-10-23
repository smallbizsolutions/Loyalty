// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || "";

console.log("API_URL configured as:", API_URL || "(empty - using relative paths)");

export async function fetchBusinessInfo(businessId) {
  const url = `${API_URL}/api/business/${businessId}`;
  console.log("Fetching business from:", url);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Business fetch failed:", res.status, text);
    throw new Error(`Failed to load business info: ${res.status} ${text}`);
  }
  
  return res.json();
}

export async function createLoyaltyId(businessId) {
  const url = `${API_URL}/api/loyalty/create`;
  console.log("Creating loyalty ID at:", url);
  console.log("Request body:", { businessId });
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
  
  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Create loyalty ID failed:", res.status, text);
    throw new Error(`Failed to create loyalty ID: ${res.status} - ${text}`);
  }
  
  const data = await res.json();
  console.log("Create loyalty ID response:", data);
  return data;
}

export async function checkPoints(businessId, loyaltyId) {
  const url = `${API_URL}/api/loyalty/check`;
  console.log("Checking points at:", url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId }),
  });
  
  console.log("Check points response status:", res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Check points failed:", res.status, text);
    throw new Error(`Failed to check points: ${res.status} - ${text}`);
  }
  
  const data = await res.json();
  console.log("Check points response:", data);
  return data;
}

export async function processPurchase(businessId, loyaltyId, amountSpent) {
  const url = `${API_URL}/api/loyalty/transaction`;
  console.log("Processing purchase at:", url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId, amountSpent }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to process purchase");
  }
  
  return res.json();
}

export async function processRedemption(businessId, loyaltyId, pointsToRedeem) {
  const url = `${API_URL}/api/loyalty/redeem`;
  console.log("Processing redemption at:", url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId, pointsToRedeem }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to redeem points");
  }
  
  return res.json();
}

export async function lookupCustomer(businessId, loyaltyId) {
  const url = `${API_URL}/api/dashboard/lookup`;
  console.log("Looking up customer at:", url);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to lookup customer");
  }
  
  return res.json();
}

export async function getDashboardStats(businessId) {
  const url = `${API_URL}/api/dashboard/stats/${businessId}`;
  console.log("Fetching dashboard stats from:", url);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Stats fetch failed:", res.status, text);
    throw new Error(`Failed to load stats: ${res.status}`);
  }
  
  return res.json();
}
