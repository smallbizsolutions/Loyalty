import React from "react";
import { createLoyaltyId } from "../utils/api.js";

export default function CreateId({ businessId, onCreate }) {
  const handleCreate = async () => {
    const res = await createLoyaltyId(businessId);
    localStorage.setItem("loyaltyId", res.loyaltyId);
    onCreate(res.loyaltyId);
  };

  return (
    <div>
      <p>Get your Loyalty ID — no signups or personal info needed.</p>
      <button onClick={handleCreate}>Generate My Loyalty ID</button>
    </div>
  );
}
