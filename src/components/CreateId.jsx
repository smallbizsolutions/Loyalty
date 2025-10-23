import React, { useState } from "react";
import { createLoyaltyId } from "../utils/api.js";

export default function CreateId({ businessId, onCreate, onShowEnter }) {
  const [created, setCreated] = useState(false);
  const [newId, setNewId] = useState(null);

  const handleCreate = async () => {
    const res = await createLoyaltyId(businessId);
    if (res?.loyaltyId) {
      localStorage.setItem("loyaltyId", res.loyaltyId);
      setNewId(res.loyaltyId);
      setCreated(true);
      onCreate(res.loyaltyId);
    }
  };

  return (
    <div>
      {!created ? (
        <>
          <button onClick={handleCreate}>Generate My Loyalty ID</button>
        </>
      ) : (
        <div>
          <p>Your Loyalty ID: <strong>{newId}</strong></p>
          <p>Save this number — you can use it on any device to access your rewards.</p>
        </div>
      )}
    </div>
  );
}
