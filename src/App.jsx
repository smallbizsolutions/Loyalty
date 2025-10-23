import React, { useState, useEffect } from "react";
import LoyaltyCard from "./components/LoyaltyCard.jsx";
import CreateId from "./components/CreateId.jsx";
import EnterId from "./components/EnterId.jsx";
import { fetchBusinessInfo, checkPoints } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem("loyaltyId"));
  const [points, setPoints] = useState(null);
  const [showEnterExisting, setShowEnterExisting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load business info
  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchBusinessInfo(businessId)
      .then((data) => {
        setBusiness(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching business:", err);
        setError(`Failed to load business info: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  // Automatically check points if ID exists
  useEffect(() => {
    if (loyaltyId && !points && businessId) {
      checkPoints(businessId, loyaltyId).then((res) => {
        if (res?.points !== undefined) setPoints(res.points);
      }).catch(console.error);
    }
  }, [loyaltyId, points, businessId]);

  const handleLogout = () => {
    localStorage.removeItem("loyaltyId");
    setLoyaltyId(null);
    setPoints(null);
  };

  return (
    <div className="widget">
      <h3>{business?.name || "Loyalty"} Rewards</h3>

      {/* Debug Info - showing state */}
      <div style={{ background: "#f0f0f0", padding: "8px", fontSize: "0.8em", marginBottom: "12px", textAlign: "left" }}>
        <div>Loading: {loading ? "YES" : "NO"}</div>
        <div>Error: {error || "none"}</div>
        <div>LoyaltyId: {loyaltyId || "none"}</div>
        <div>Points: {points !== null ? points : "null"}</div>
        <div>Show Enter: {showEnterExisting ? "YES" : "NO"}</div>
      </div>

      {/* Debug Info */}
      {error && (
        <div style={{ background: "#fee", padding: "12px", borderRadius: "6px", marginBottom: "12px", fontSize: "0.9em" }}>
          <strong>Error:</strong> {error}
          <br />
          <small>BusinessId: {businessId || "missing"}</small>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {!loading && !error && !loyaltyId && !showEnterExisting && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ marginBottom: "16px" }}>No signups or personal info needed.</p>
          <CreateId
            businessId={businessId}
            onCreate={setLoyaltyId}
            onShowEnter={() => setShowEnterExisting(true)}
          />
          <button
            style={{ marginTop: "12px", background: "transparent", color: "#6366f1", border: "none", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setShowEnterExisting(true)}
          >
            Already have a Loyalty ID?
          </button>
        </div>
      )}

      {!loading && !error && !loyaltyId && showEnterExisting && (
        <>
          <EnterId
            businessId={businessId}
            setLoyaltyId={setLoyaltyId}
            setPoints={setPoints}
          />
          <button
            style={{ marginTop: "12px", background: "transparent", color: "#6366f1", border: "none", cursor: "pointer" }}
            onClick={() => setShowEnterExisting(false)}
          >
            Need a new Loyalty ID?
          </button>
        </>
      )}

      {!loading && !error && loyaltyId && points !== null && (
        <LoyaltyCard loyaltyId={loyaltyId} points={points} onLogout={handleLogout} />
      )}
    </div>
  );
}
