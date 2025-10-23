import React, { useState, useEffect } from "react";
import LoyaltyCard from "./components/LoyaltyCard.jsx";
import CreateId from "./components/CreateId.jsx";
import EnterId from "./components/EnterId.jsx";
import { fetchBusinessInfo, checkPoints } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem("loyaltyId"));
  const [points, setPoints] = useState(null);
  const [showEnterExisting, setShowEnterExisting] = useState(false);

  // Fetch business info
  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await fetchBusinessInfo(businessId);
        setBusiness(data);
      } catch (err) {
        setError(err.message || "Failed to load business");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  // Fetch points if a loyalty ID already exists
  useEffect(() => {
    async function loadPoints() {
      if (loyaltyId) {
        try {
          const res = await checkPoints(businessId, loyaltyId);
          if (res?.points !== undefined) setPoints(res.points);
        } catch {
          console.warn("No points found for loyaltyId:", loyaltyId);
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

  // --- UI RENDER ---
  if (loading) {
    return (
      <div className="widget">
        <p>Loading business...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget">
        <h3>Error loading business</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="widget">
      {business && <h3>{business.name} Rewards</h3>}

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
    </div>
  );
}
