import React, { useState } from "react";
import { checkPoints } from "../utils/api.js";

export default function EnterId({ businessId, loyaltyId, points, setPoints }) {
  const [input, setInput] = useState(loyaltyId || "");

  const handleCheck = async () => {
    const data = await checkPoints(businessId, input);
    if (data?.points !== undefined) {
      localStorage.setItem("loyaltyId", input);
      setPoints(data.points);
    }
  };

  return (
    <div>
      <input
        placeholder="Enter Loyalty ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleCheck}>Check Points</button>
    </div>
  );
}
