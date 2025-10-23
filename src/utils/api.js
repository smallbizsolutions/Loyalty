const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function fetchBusinessInfo(businessId) {
  const res = await fetch(`${API_URL}/business/${businessId}`);
  return res.json();
}

export async function createLoyaltyId(businessId) {
  const res = await fetch(`${API_URL}/loyalty/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
  return res.json();
}

export async function checkPoints(businessId, loyaltyId) {
  const res = await fetch(`${API_URL}/loyalty/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, loyaltyId }),
  });
  return res.json();
}
