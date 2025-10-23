import React, { useState } from "react";
import { checkPoints } from "../utils/api.js";

export default function EnterId({ businessId, setLoyaltyId, setPoints }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    const data = await checkPoints(businessId, input.trim());
    if (data?.points !== undefined) {
      localStorage.setItem("loyaltyId", input.trim());
      setLoyaltyId(input.trim());
      setPoints(data.points);
      setError(null);
    } else {
      setError("Loyalty ID not found. Try again or generate a new one.");
    }
  };

  return (
    <div>
      <input
        placeholder="Enter your Loyalty ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleCheck}>Check Points</button>
      {error && <p style={{ color: "red", fontSize: "0.9em" }}>{error}</p>}
    </div>
  );
}
