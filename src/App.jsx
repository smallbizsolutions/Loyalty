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

  // Load business info
  useEffect(() => {
    fetchBusinessInfo(businessId).then(setBusiness).catch(console.error);
  }, [businessId]);

  // Automatically check points if ID exists
  useEffect(() => {
    if (loyaltyId && !points) {
      checkPoints(businessId, loyaltyId).then((res) => {
        if (res?.points !== undefined) setPoints(res.points);
      });
    }
  }, [loyaltyId, points, businessId]);

  const handleLogout = () => {
    localStorage.removeItem("loyaltyId");
    setLoyaltyId(null);
    setPoints(null);
  };

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
            style={{ marginTop: "12px", background: "transparent", color: "#6366f1", border: "none", cursor: "pointer" }}
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
            style={{ marginTop: "12px", background: "transparent", color: "#6366f1", border: "none", cursor: "pointer" }}
            onClick={() => setShowEnterExisting(false)}
          >
            Need a new Loyalty ID?
          </button>
        </>
      )}

      {loyaltyId && points !== null && (
        <LoyaltyCard loyaltyId={loyaltyId} points={points} onLogout={handleLogout} />
      )}
    </div>
  );
}
