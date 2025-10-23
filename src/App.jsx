import React, { useState, useEffect } from "react";
import LoyaltyCard from "./components/LoyaltyCard.jsx";
import CreateId from "./components/CreateId.jsx";
import EnterId from "./components/EnterId.jsx";
import { fetchBusinessInfo } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem("loyaltyId"));
  const [points, setPoints] = useState(null);

  useEffect(() => {
    fetchBusinessInfo(businessId).then(setBusiness);
  }, [businessId]);

  return (
    <div className="widget">
      {business && <h3>{business.name} Rewards</h3>}
      {!loyaltyId ? (
        <CreateId businessId={businessId} onCreate={setLoyaltyId} />
      ) : (
        <EnterId
          businessId={businessId}
          loyaltyId={loyaltyId}
          points={points}
          setPoints={setPoints}
        />
      )}
      {points !== null && (
        <LoyaltyCard loyaltyId={loyaltyId} points={points} />
      )}
    </div>
  );
}
