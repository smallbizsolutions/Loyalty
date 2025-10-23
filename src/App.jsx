import React, { useState, useEffect } from "react";
import LoyaltyCard from "./components/LoyaltyCard.jsx";
import CreateId from "./components/CreateId.jsx";
import EnterId from "./components/EnterId.jsx";
import { fetchBusinessInfo, checkPoints } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem("loyaltyId"));
  const [points, setPoints] = useState(null);
  const [showEnterExisting, setShowEnterExisting] = useState(false);

  // Fetch business info on load
  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await fetchBusinessInfo(businessId);
        setBusiness(data);
      } catch (err) {
        console.error("Failed to fetch business info:", err);
        setError("Could not load business info");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  // Fetch points if a loyaltyId exists
  useEffect(() => {
    async function loadPoints() {
      if (loyaltyId) {
        try {
          const res = await checkPoints(businessId, loyaltyId);
          if (res?.points !== undefined) setPoints(res.points);
        } catch (err) {
          console.warn("Error fetching points:", err);
        }
      }
    }
    loadPoints();
  }, [businessId, loyaltyId]);

  const handleLogout = () => {
    localStorage.removeItem("loyaltyId");
    setLoyaltyId(null);
    setPoints(null);
    setShowEnterExisting(false);
  };

  if (loading) return <p>Loading business...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="widget">
      <h3>{business?.name || "Rewards"}</h3>

      {!loyaltyId && !showEnterExisting && (
        <>
          <p>No signups or personal info needed.</p>
          <CreateId
            businessId={businessId}
            onCreate={setLoyaltyId}
            onShowEnter={() => setShowEnterExisting(true)}
          />
          <button
            style={{
              marginTop: "12px",
              background: "transparent",
              color: "#6366f1",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowEnterExisting(true)}
          >
            Already have a Loyalty ID?
          </button>
        </>
      )}

      {!loyaltyId && showEnterExisting && (
        <>
          <EnterId
            businessId={businessId}
            setLoyaltyId={setLoyaltyId}
            setPoints={setPoints}
          />
          <button
            style={{
              marginTop: "12px",
              background: "transparent",
              color: "#6366f1",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowEnterExisting(false)}
          >
            Need a new Loyalty ID?
          </button>
        </>
      )}

      {loyaltyId && points !== null && (
        <LoyaltyCard
          loyaltyId={loyaltyId}
          points={points}
          onLogout={handleLogout}
        />
      )}

      {!loyaltyId && !showEnterExisting && points === null && (
        <p style={{ marginTop: "20px", color: "#777" }}>
          Generate or enter a Loyalty ID to start earning rewards.
        </p>
      )}
    </div>
  );
}
