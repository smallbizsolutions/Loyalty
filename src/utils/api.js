// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchBusinessInfo(businessId) {
  const res = await fetch(`${API_URL}/api/business/${businessId}`);
  if (!res.ok) throw new Error("Failed to load business info");
  return res.json();
}

export async function createLoyaltyId(businessId) {
  const res = await fetch(`${API_URL}/api/loyalty/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create loyalty ID: ${text}`);
  }
  return res.json();
}

export async function checkPoints(businessId, loyaltyId) {
  const res = await fetch(`${API_URL}/api/loyalty/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId }),
  });
  if (!res.ok) throw new Error("Failed to check points");
  return res.json();
}
