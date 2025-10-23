import React, { useEffect, useState } from "react";
import { fetchBusinessInfo, createLoyaltyId, checkPoints } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem("loyaltyId"));
  const [points, setPoints] = useState(null);
  const [showEnter, setShowEnter] = useState(false);
  const [input, setInput] = useState("");

  // Load business info
  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await fetchBusinessInfo(businessId);
        setBusiness(data);
      } catch (err) {
        console.error("Business fetch failed:", err);
        setError("Failed to load business info");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  // If loyalty ID exists, load their points
  useEffect(() => {
    async function loadPoints() {
      if (!loyaltyId) return;
      const data = await checkPoints(businessId, loyaltyId);
      if (data?.points !== undefined) setPoints(data.points);
    }
    loadPoints();
  }, [businessId, loyaltyId]);

  // Create new anonymous ID
  const handleCreate = async () => {
    try {
      const res = await createLoyaltyId(businessId);
      if (res?.loyaltyId) {
        localStorage.setItem("loyaltyId", res.loyaltyId);
        setLoyaltyId(res.loyaltyId);
        setPoints(0);
      }
    } catch (err) {
      console.error("Failed to create loyalty ID:", err);
    }
  };

  // Enter existing ID
  const handleEnter = async () => {
    if (!input.trim()) return;
    const res = await checkPoints(businessId, input.trim());
    if (res?.points !== undefined) {
      localStorage.setItem("loyaltyId", input.trim());
      setLoyaltyId(input.trim());
      setPoints(res.points);
    } else {
      alert("ID not found");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loyaltyId");
    setLoyaltyId(null);
    setPoints(null);
    setInput("");
  };

  if (loading) return <p>Loading business...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ textAlign: "center", padding: 20, fontFamily: "sans-serif" }}>
      <h3>{business?.name || "Rewards"}</h3>

      {/* If user already has loyalty ID */}
      {loyaltyId && (
        <div>
          <p>
            Your Loyalty ID: <strong>{loyaltyId}</strong>
          </p>
          <p>
            Points: <strong>{points ?? "Loading..."}</strong>
          </p>
          <button onClick={handleLogout}>Forget this device</button>
        </div>
      )}

      {/* No loyalty ID yet */}
      {!loyaltyId && (
        <>
          {!showEnter ? (
            <>
              <p>No signup needed — get your loyalty ID instantly.</p>
              <button onClick={handleCreate}>Generate My Loyalty ID</button>
              <div style={{ marginTop: 10 }}>
                <button
                  style={{
                    background: "transparent",
                    color: "#6366f1",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowEnter(true)}
                >
                  Already have an ID?
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your loyalty ID"
                style={{ padding: 8, marginRight: 8 }}
              />
              <button onClick={handleEnter}>Check Points</button>
              <div style={{ marginTop: 10 }}>
                <button
                  style={{
                    background: "transparent",
                    color: "#6366f1",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowEnter(false)}
                >
                  Need a new ID?
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
