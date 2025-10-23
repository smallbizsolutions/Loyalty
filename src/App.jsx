import React, { useEffect, useState } from "react";
import { fetchBusinessInfo, createLoyaltyId, checkPoints } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyId, setLoyaltyId] = useState(localStorage.getItem(`loyalty_${businessId}`));
  const [points, setPoints] = useState(null);
  const [showEnter, setShowEnter] = useState(false);
  const [input, setInput] = useState("");
  const [checkError, setCheckError] = useState(null);
  const [isWidget, setIsWidget] = useState(false);

  // Check if we're in widget mode (iframe)
  useEffect(() => {
    setIsWidget(window.self !== window.top);
  }, []);

  // Load business info
  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await fetchBusinessInfo(businessId);
        setBusiness(data);
      } catch (err) {
        setError("Business not found. Please check your URL.");
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
      try {
        const data = await checkPoints(businessId, loyaltyId);
        if (data?.points !== undefined) setPoints(data.points);
      } catch (err) {
        console.error("Failed to load points:", err);
      }
    }
    loadPoints();
  }, [businessId, loyaltyId]);

  // Create new ID
  const handleCreate = async () => {
    try {
      const res = await createLoyaltyId(businessId);
      if (res?.loyaltyId) {
        localStorage.setItem(`loyalty_${businessId}`, res.loyaltyId);
        setLoyaltyId(res.loyaltyId);
        setPoints(0);
      }
    } catch (err) {
      setError("Failed to create loyalty ID. Please try again.");
    }
  };

  // Enter existing ID
  const handleEnter = async () => {
    if (!input.trim()) return;
    setCheckError(null);
    try {
      const res = await checkPoints(businessId, input.trim());
      if (res?.points !== undefined) {
        localStorage.setItem(`loyalty_${businessId}`, input.trim());
        setLoyaltyId(input.trim());
        setPoints(res.points);
        setInput("");
      }
    } catch (err) {
      setCheckError("ID not found. Please check the number and try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`loyalty_${businessId}`);
    setLoyaltyId(null);
    setPoints(null);
    setInput("");
  };

  const handleClose = () => {
    // Send message to parent window to close widget
    if (isWidget) {
      window.parent.postMessage("close-widget", "*");
    }
  };

  const themeColor = business?.themeColor || "#6366f1";

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Close button for widget mode */}
      {isWidget && (
        <button onClick={handleClose} style={styles.closeButton}>
          ✕
        </button>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={{ ...styles.title, color: themeColor }}>
          {business?.name || "Rewards"}
        </h2>
        <p style={styles.subtitle}>Your loyalty rewards in one place</p>
      </div>

      {/* Logged in view */}
      {loyaltyId && (
        <div style={styles.card}>
          <div style={styles.idSection}>
            <span style={styles.label}>Your Loyalty ID</span>
            <div style={{ ...styles.idDisplay, borderColor: themeColor }}>
              {loyaltyId}
            </div>
          </div>

          <div style={styles.pointsSection}>
            <span style={styles.label}>Current Balance</span>
            <div style={{ ...styles.pointsDisplay, color: themeColor }}>
              {points ?? "..."} points
            </div>
          </div>

          <div style={styles.info}>
            💡 Save this ID! Show it at checkout to earn and redeem points.
          </div>

          <button
            onClick={handleLogout}
            style={styles.secondaryButton}
          >
            Use Different ID
          </button>
        </div>
      )}

      {/* Not logged in view */}
      {!loyaltyId && (
        <div style={styles.card}>
          {!showEnter ? (
            <>
              <div style={styles.welcome}>
                <h3 style={styles.welcomeTitle}>Get Started</h3>
                <p style={styles.welcomeText}>
                  No signup required! Get your 6-digit loyalty ID instantly and start earning rewards.
                </p>
              </div>

              <button
                onClick={handleCreate}
                style={{ ...styles.primaryButton, backgroundColor: themeColor }}
              >
                Generate My Loyalty ID
              </button>

              <button
                onClick={() => setShowEnter(true)}
                style={styles.linkButton}
              >
                Already have an ID? Enter it here
              </button>
            </>
          ) : (
            <>
              <div style={styles.welcome}>
                <h3 style={styles.welcomeTitle}>Enter Your ID</h3>
                <p style={styles.welcomeText}>
                  Enter your 6-digit loyalty ID to check your balance.
                </p>
              </div>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit ID"
                style={styles.input}
                maxLength={6}
                inputMode="numeric"
              />

              {checkError && (
                <div style={styles.errorText}>{checkError}</div>
              )}

              <button
                onClick={handleEnter}
                disabled={input.length !== 6}
                style={{
                  ...styles.primaryButton,
                  backgroundColor: input.length === 6 ? themeColor : "#ccc",
                }}
              >
                Check Balance
              </button>

              <button
                onClick={() => {
                  setShowEnter(false);
                  setCheckError(null);
                }}
                style={styles.linkButton}
              >
                Need a new ID?
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px",
    maxWidth: "400px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#666",
    cursor: "pointer",
    padding: "8px",
    lineHeight: "1",
    zIndex: "10",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  errorBox: {
    background: "#fee",
    color: "#c00",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    margin: 0,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  idSection: {
    marginBottom: "25px",
  },
  pointsSection: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    fontWeight: "600",
  },
  idDisplay: {
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    padding: "15px",
    border: "3px solid",
    borderRadius: "12px",
    letterSpacing: "4px",
  },
  pointsDisplay: {
    fontSize: "36px",
    fontWeight: "bold",
    textAlign: "center",
  },
  info: {
    background: "#f0f9ff",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#0369a1",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  welcome: {
    marginBottom: "25px",
    textAlign: "center",
  },
  welcomeTitle: {
    fontSize: "20px",
    margin: "0 0 10px 0",
  },
  welcomeText: {
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  input: {
    width: "100%",
    padding: "15px",
    fontSize: "24px",
    textAlign: "center",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "15px",
    letterSpacing: "4px",
    fontWeight: "bold",
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  secondaryButton: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#666",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  linkButton: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    color: "#6366f1",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "10px",
    textAlign: "center",
  },
};
