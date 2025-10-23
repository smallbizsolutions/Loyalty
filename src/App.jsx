import React, { useEffect, useState } from "react";
import { fetchBusinessInfo } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      try {
        console.log("Fetching business:", businessId);
        const data = await fetchBusinessInfo(businessId);
        console.log("Business data:", data);
        setBusiness(data);
      } catch (err) {
        console.error("Business fetch failed:", err);
        setError(err.message || "Failed to load business");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  if (loading) return <p>Loading business info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!business) return <p>No business found for ID {businessId}</p>;

  return (
    <div className="widget" style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h3>{business.name} Rewards</h3>
      <p style={{ marginTop: 10 }}>
        ✅ Widget loaded successfully for <strong>{businessId}</strong>.
      </p>
      <p>
        (If you still see only this text, that means the fetch worked and the
        rest of your UI isn’t being rendered yet.)
      </p>
    </div>
  );
}
