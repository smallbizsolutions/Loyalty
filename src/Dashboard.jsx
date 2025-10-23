import React, { useEffect, useState } from "react";
import { 
  fetchBusinessInfo, 
  processPurchase, 
  processRedemption,
  lookupCustomer,
  getDashboardStats 
} from "./utils/api.js";

export default function Dashboard({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("earn"); // earn, redeem, lookup, stats
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [loyaltyId, setLoyaltyId] = useState("");
  const [amount, setAmount] = useState("");
  const [points, setPoints] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      const [businessData, statsData] = await Promise.all([
        fetchBusinessInfo(businessId),
        getDashboardStats(businessId)
      ]);
      setBusiness(businessData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEarnPoints = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const result = await processPurchase(businessId, loyaltyId, parseFloat(amount));
      setMessage({ type: "success", text: result.message });
      setLoyaltyId("");
      setAmount("");
      loadData(); // Refresh stats
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const result = await processRedemption(businessId, loyaltyId, parseInt(points));
      setMessage({ type: "success", text: result.message });
      setLoyaltyId("");
      setPoints("");
      loadData(); // Refresh stats
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setMessage(null);
    setCustomerData(null);
    try {
      const result = await lookupCustomer(businessId, loyaltyId);
      setCustomerData(result);
    } catch (err) {
      setMessage({ type: "error", text: "Customer not found" });
    }
  };

  if (loading) {
    return <div style={styles.container}><div style={styles.loader}>Loading dashboard...</div></div>;
  }

  const themeColor = business?.themeColor || "#6366f1";

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: themeColor }}>{business?.name} Dashboard</h1>
        <p style={styles.subtitle}>Manage your loyalty program</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.customerCount}</div>
            <div style={styles.statLabel}>Total Customers</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#10b981" }}>{stats.totalPointsAwarded}</div>
            <div style={styles.statLabel}>Points Awarded</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#ef4444" }}>{stats.totalPointsRedeemed}</div>
            <div style={styles.statLabel}>Points Redeemed</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {["earn", "redeem", "lookup"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setMessage(null);
              setCustomerData(null);
            }}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? { ...styles.activeTab, borderBottomColor: themeColor, color: themeColor } : {}),
            }}
          >
            {tab === "earn" && "💰 Award Points"}
            {tab === "redeem" && "🎁 Redeem Points"}
            {tab === "lookup" && "🔍 Look Up Customer"}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
          color: message.type === "success" ? "#065f46" : "#991b1b",
        }}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {activeTab === "earn" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Award Points for Purchase</h2>
            <p style={styles.cardDescription}>
              Enter the customer's loyalty ID and purchase amount. They'll earn {business?.pointsPerDollar} points per dollar.
            </p>
            <form onSubmit={handleEarnPoints}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Loyalty ID</label>
                <input
                  type="text"
                  value={loyaltyId}
                  onChange={(e) => setLoyaltyId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit ID"
                  required
                  maxLength={6}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Purchase Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  style={styles.input}
                />
              </div>
              {amount && (
                <div style={styles.preview}>
                  Customer will earn: <strong>{Math.floor(parseFloat(amount || 0) * business?.pointsPerDollar)} points</strong>
                </div>
              )}
              <button
                type="submit"
                disabled={loyaltyId.length !== 6 || !amount}
                style={{
                  ...styles.button,
                  backgroundColor: loyaltyId.length === 6 && amount ? themeColor : "#d1d5db",
                }}
              >
                Award Points
              </button>
            </form>
          </div>
        )}

        {activeTab === "redeem" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Redeem Points</h2>
            <p style={styles.cardDescription}>
              Enter the customer's loyalty ID and points to redeem.
            </p>
            <form onSubmit={handleRedeemPoints}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Loyalty ID</label>
                <input
                  type="text"
                  value={loyaltyId}
                  onChange={(e) => setLoyaltyId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit ID"
                  required
                  maxLength={6}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Points to Redeem</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="0"
                  required
                  min="1"
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={loyaltyId.length !== 6 || !points}
                style={{
                  ...styles.button,
                  backgroundColor: loyaltyId.length === 6 && points ? themeColor : "#d1d5db",
                }}
              >
                Redeem Points
              </button>
            </form>
          </div>
        )}

        {activeTab === "lookup" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Look Up Customer</h2>
            <p style={styles.cardDescription}>
              View customer details and transaction history.
            </p>
            <form onSubmit={handleLookup}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Loyalty ID</label>
                <input
                  type="text"
                  value={loyaltyId}
                  onChange={(e) => setLoyaltyId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit ID"
                  required
                  maxLength={6}
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={loyaltyId.length !== 6}
                style={{
                  ...styles.button,
                  backgroundColor: loyaltyId.length === 6 ? themeColor : "#d1d5db",
                }}
              >
                Look Up
              </button>
            </form>

            {customerData && (
              <div style={styles.customerDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Current Balance:</span>
                  <span style={{ ...styles.detailValue, color: themeColor, fontSize: "24px", fontWeight: "bold" }}>
                    {customerData.customer.points} points
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer Since:</span>
                  <span style={styles.detailValue}>
                    {new Date(customerData.customer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {customerData.transactions.length > 0 && (
                  <>
                    <h3 style={styles.sectionTitle}>Recent Transactions</h3>
                    <div style={styles.transactions}>
                      {customerData.transactions.map((txn) => (
                        <div key={txn.id} style={styles.transaction}>
                          <div>
                            <div style={styles.txnType}>
                              {txn.type === "earn" ? "💰 Purchase" : "🎁 Redemption"}
                            </div>
                            <div style={styles.txnDate}>
                              {new Date(txn.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div style={{
                            ...styles.txnPoints,
                            color: txn.pointsChanged > 0 ? "#10b981" : "#ef4444"
                          }}>
                            {txn.pointsChanged > 0 ? "+" : ""}{txn.pointsChanged} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {stats?.recentTransactions?.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>
          <div style={styles.transactions}>
            {stats.recentTransactions.slice(0, 5).map((txn) => (
              <div key={txn.id} style={styles.transaction}>
                <div>
                  <div style={styles.txnType}>
                    {txn.type === "earn" ? "💰" : "🎁"} ID: {txn.loyaltyId}
                  </div>
                  <div style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  ...styles.txnPoints,
                  color: txn.pointsChanged > 0 ? "#10b981" : "#ef4444"
                }}>
                  {txn.pointsChanged > 0 ? "+" : ""}{txn.pointsChanged} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Widget Link */}
      <div style={styles.footer}>
        <p style={styles.footerText}>Customer Widget URL:</p>
        <code style={styles.code}>
          {window.location.origin}?businessId={businessId}
        </code>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: "8px",
  },
  statLabel: {
    color: "#666",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "2px solid #e5e7eb",
  },
  tab: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    color: "#666",
    transition: "all 0.2s",
  },
  activeTab: {
    fontWeight: "600",
  },
  content: {
    marginBottom: "30px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  cardDescription: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "24px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    boxSizing: "border-box",
  },
  preview: {
    background: "#f0f9ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "#0369a1",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  message: {
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  customerDetails: {
    marginTop: "30px",
    paddingTop: "30px",
    borderTop: "2px solid #e5e7eb",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  detailLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "24px",
    marginBottom: "16px",
  },
  transactions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  transaction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  txnType: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  txnDate: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
  },
  txnPoints: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  footerText:
