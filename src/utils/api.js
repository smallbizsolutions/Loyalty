// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchBusinessInfo(businessId) {
  const res = await fetch(`${API_URL}/api/business/${businessId}`);
  if (!res.ok) throw new Error("Failed to load business");
  return res.json();
}

export async function registerCustomer(businessId, phone, referredBy, source) {
  const res = await fetch(`${API_URL}/api/loyalty/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, phone, referredBy, source }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to register");
  }
  
  return res.json();
}

export async function checkCustomer(businessId, phone) {
  const res = await fetch(`${API_URL}/api/loyalty/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, phone }),
  });
  
  if (!res.ok) throw new Error("Customer not found");
  return res.json();
}

export async function getCustomers(businessId) {
  const res = await fetch(`${API_URL}/api/loyalty/customers/${businessId}`);
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export async function giveReward(businessId, phone, rewardAmount, note) {
  const res = await fetch(`${API_URL}/api/loyalty/reward`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, phone, rewardAmount, note }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to give reward");
  }
  
  return res.json();
}

export async function lookupCustomer(businessId, phone) {
  const res = await fetch(`${API_URL}/api/dashboard/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, phone }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Customer not found");
  }
  
  return res.json();
}

export async function getDashboardStats(businessId) {
  const res = await fetch(`${API_URL}/api/dashboard/stats/${businessId}`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}
