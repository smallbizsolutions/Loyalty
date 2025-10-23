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
