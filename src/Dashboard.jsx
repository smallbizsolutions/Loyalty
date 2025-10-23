import React, { useEffect, useState } from "react";
import { 
  fetchBusinessInfo, 
  lookupCustomer,
  getDashboardStats,
  giveReward
} from "./utils/api.js";

export default function Dashboard({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [phone, setPhone] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
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

  const handleLookup = async (e) => {
    e.preventDefault();
    setMessage(null);
    setCustomerData(null);
    try {
      const result = await lookupCustomer(businessId, phone);
      setCustomerData(result);
    } catch (err) {
      setMessage({ type: "error", text: "Customer not found" });
    }
  };

  const handleGiveReward = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const result = await giveReward(businessId, phone, parseFloat(rewardAmount), "Referral reward");
      setMessage({ type: "success", text: result.message });
      setRewardAmount("");
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const formatPhone = (val) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const themeColor = business?.themeColor || "#6366f1";

  if (loading) {
    return <div style={styles.container}><div style={styles.loader}>Loading dashboard...</div></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: themeColor }}>{business?.name} Dashboard</h1>
        <p style={styles.subtitle}>Track referrals and reward your best customers</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.customerCount}</div>
            <div style={styles.statLabel}>Total Customers</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#10b981" }}>{stats.referralCount}</div>
            <div style={styles.statLabel}>From Referrals</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: "#f59e0b" }}>{stats.directCount}</div>
            <div style={styles.statLabel}>Direct / Other</div>
          </div>
        </div>
      )}

      {/* Top Referrers */}
      {stats?.topReferrers && stats.topReferrers.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🏆 Top Referrers</h2>
          <div style={styles.leaderboard}>
            {stats.topReferrers.map((referrer, idx) => (
              <div key={idx} style={styles.leaderboardItem}>
                <div style={styles.leaderboardRank}>#{idx + 1}</div>
                <div style={styles.leaderboardPhone}>{formatPhone(referrer.phone)}</div>
                <div style={{ ...styles.leaderboardCount, color: themeColor }}>
                  {referrer.referral_count} referrals
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview", "lookup", "reward"].map((tab) => (
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
            {tab === "overview" && "📊 Overview"}
            {tab === "lookup" && "🔍 Look Up Customer"}
            {tab === "reward" && "🎁 Give Reward"}
          </button>
        ))}
      </div>

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
        {activeTab === "overview" && (
          <>
            {/* Source Breakdown */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Customer Sources</h2>
              <div style={styles.sourceList}>
                <div style={styles.sourceItem}>
                  <span>👥 Referrals</span>
                  <strong>{stats?.referralCount || 0}</strong>
                </div>
                <div style={styles.sourceItem}>
                  <span>🚶 Direct</span>
                  <strong>{stats?.directCount || 0}</strong>
                </div>
                <div style={styles.sourceItem}>
                  <span>📱 Social Media</span>
                  <strong>{stats?.socialCount || 0}</strong>
                </div>
                <div style={styles.sourceItem}>
                  <span>🔍 Other</span>
                  <strong>{stats?.otherCount || 0}</strong>
                </div>
              </div>
            </div>

            {/* Recent Customers */}
            {stats?.recentCustomers && stats.recentCustomers.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Recent Customers</h2>
                <div style={styles.customerList}>
                  {stats.recentCustomers.map((customer, idx) => (
                    <div key={idx} style={styles.customerItem}>
                      <div>
                        <div style={styles.customerPhone}>{formatPhone(customer.phone)}</div>
                        <div style={styles.customerMeta}>
                          {customer.source === 'referral' && '👥 Referred'}
                          {customer.source === 'direct' && '🚶 Direct'}
                          {customer.source === 'social' && '📱 Social'}
                          {customer.source === 'other' && '🔍 Other'}
                          {' • '}
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ ...styles.customerReferrals, color: themeColor }}>
                        {customer.referral_count || 0} referrals
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "lookup" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Look Up Customer</h2>
            <p style={styles.cardDescription}>
              View customer referral history and activity.
            </p>
            <form onSubmit={handleLookup}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="(555) 123-4567"
                  required
                  maxLength={14}
                  style={styles.input}
                  inputMode="numeric"
                />
              </div>
              <button
                type="submit"
                disabled={phone.replace(/\D/g, '').length !== 10}
                style={{
                  ...styles.button,
                  backgroundColor: phone.replace(/\D/g, '').length === 10 ? themeColor : "#d1d5db",
                }}
              >
                Look Up
              </button>
            </form>

            {customerData && (
              <div style={styles.customerDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone:</span>
                  <span style={styles.detailValue}>{formatPhone(customerData.customer.phone)}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Total Referrals:</span>
                  <span style={{ ...styles.detailValue, color: themeColor, fontSize: "20px", fontWeight: "bold" }}>
                    {customerData.customer.referral_count || 0}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Source:</span>
                  <span style={styles.detailValue}>
                    {customerData.customer.source === 'referral' && '👥 Referred by friend'}
                    {customerData.customer.source === 'direct' && '🚶 Direct'}
                    {customerData.customer.source === 'social' && '📱 Social Media'}
                    {customerData.customer.source === 'other' && '🔍 Other'}
                  </span>
                </div>
                {customerData.referredBy && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Referred By:</span>
                    <span style={styles.detailValue}>{formatPhone(customerData.referredBy.phone)}</span>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer Since:</span>
                  <span style={styles.detailValue}>
                    {new Date(customerData.customer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {customerData.referrals && customerData.referrals.length > 0 && (
                  <>
                    <h3 style={styles.sectionTitle}>People They Referred</h3>
                    <div style={styles.referralsList}>
                      {customerData.referrals.map((ref, idx) => (
                        <div key={idx} style={styles.referralItem}>
                          <span>{formatPhone(ref.phone)}</span>
                          <span style={styles.referralDate}>
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "reward" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Give Referral Reward</h2>
            <p style={styles.cardDescription}>
              Reward customers for successful referrals. Default: ${business?.referral_reward_amount || 10} after {business?.referrals_needed_for_reward || 3} referrals.
            </p>
            <form onSubmit={handleGiveReward}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="(555) 123-4567"
                  required
                  maxLength={14}
                  style={styles.input}
                  inputMode="numeric"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reward Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="10.00"
                  required
                  min="0"
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={phone.replace(/\D/g, '').length !== 10 || !rewardAmount}
                style={{
                  ...styles.button,
                  backgroundColor: (phone.replace(/\D/g, '').length === 10 && rewardAmount) ? themeColor : "#d1d5db",
                }}
              >
                Give ${rewardAmount || '0'} Reward
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>Customer Widget URL:</p>
        <code style={styles.code}>
          {window.location.origin}?businessId={businessId}
        </code>
        <p style={styles.footerSubtext}>Embed this on your website so customers can check their referral status</p>
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
  leaderboard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  leaderboardRank: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#666",
    minWidth: "40px",
  },
  leaderboardPhone: {
    fontSize: "16px",
    fontWeight: "600",
    flex: 1,
  },
  leaderboardCount: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  sourceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sourceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "16px",
  },
  customerList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  customerItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  customerPhone: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  customerMeta: {
    fontSize: "13px",
    color: "#666",
    marginTop: "4px",
  },
  customerReferrals: {
    fontSize: "14px",
    fontWeight: "bold",
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
  message: {
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
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
  referralsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  referralItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  referralDate: {
    color: "#666",
    fontSize: "13px",
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  footerText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
  },
  code: {
    display: "block",
    padding: "12px",
    background: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "monospace",
    wordBreak: "break-all",
    marginBottom: "10px",
  },
  footerSubtext: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
};
