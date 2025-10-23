import React, { useEffect, useState } from "react";
import { fetchBusinessInfo, registerCustomer, checkCustomer, getCustomers } from "./utils/api.js";

export default function App({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState(localStorage.getItem(`referral_phone_${businessId}`));
  const [customerData, setCustomerData] = useState(null);
  const [showRegister, setShowRegister] = useState(!phone);
  const [input, setInput] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [source, setSource] = useState("direct");
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState(null);
  const [isWidget, setIsWidget] = useState(false);

  useEffect(() => {
    setIsWidget(window.self !== window.top);
  }, []);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await fetchBusinessInfo(businessId);
        setBusiness(data);
        
        // Load customer list for referral dropdown
        const custData = await getCustomers(businessId);
        setCustomers(custData.customers || []);
      } catch (err) {
        setError("Business not found");
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [businessId]);

  useEffect(() => {
    async function loadCustomer() {
      if (!phone) return;
      try {
        const data = await checkCustomer(businessId, phone);
        setCustomerData(data);
      } catch (err) {
        console.error("Failed to load customer:", err);
      }
    }
    loadCustomer();
  }, [businessId, phone]);

  const handleRegister = async () => {
    if (!input.trim()) return;
    setMessage(null);
    try {
      const res = await registerCustomer(
        businessId, 
        input.trim(), 
        source === 'referral' ? referrerPhone : null,
        source
      );
      
      localStorage.setItem(`referral_phone_${businessId}`, res.phone);
      setPhone(res.phone);
      setCustomerData({ phone: res.phone, referralCount: 0, referrals: [] });
      setInput("");
      setShowRegister(false);
      
      if (res.wasReferred) {
        setMessage({ type: "success", text: "Thanks for joining! Your friend will get credit for referring you! 🎉" });
      } else {
        setMessage({ type: "success", text: "Welcome! Start referring friends to earn rewards! 🎁" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCheck = async () => {
    if (!input.trim()) return;
    setMessage(null);
    try {
      const res = await checkCustomer(businessId, input.trim());
      localStorage.setItem(`referral_phone_${businessId}`, input.trim());
      setPhone(input.trim());
      setCustomerData(res);
      setInput("");
      setShowRegister(false);
    } catch (err) {
      setMessage({ type: "error", text: "Phone not found. Try registering instead!" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`referral_phone_${businessId}`);
    setPhone(null);
    setCustomerData(null);
    setInput("");
    setShowRegister(true);
  };

  const handleClose = () => {
    if (isWidget) {
      window.parent.postMessage("close-widget", "*");
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
    return <div style={styles.container}><div style={styles.loader}>Loading...</div></div>;
  }

  if (error && !phone) {
    return <div style={styles.container}><div style={styles.errorBox}>{error}</div></div>;
  }

  return (
    <div style={styles.container}>
      {isWidget && (
        <button onClick={handleClose} style={styles.closeButton}>✕</button>
      )}

      <div style={styles.header}>
        <h2 style={{ ...styles.title, color: themeColor }}>
          {business?.name || "Referral Program"}
        </h2>
        <p style={styles.subtitle}>Refer friends and earn rewards</p>
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

      {phone && customerData && (
        <div style={styles.card}>
          <div style={styles.section}>
            <span style={styles.label}>Your Phone Number</span>
            <div style={{ ...styles.display, borderColor: themeColor }}>
              {formatPhone(phone)}
            </div>
          </div>

          <div style={styles.section}>
            <span style={styles.label}>Friends You've Referred</span>
            <div style={{ ...styles.bigNumber, color: themeColor }}>
              {customerData.referralCount || 0}
            </div>
          </div>

          {customerData.referrals && customerData.referrals.length > 0 && (
            <div style={styles.referralList}>
              <p style={styles.listTitle}>Recent Referrals:</p>
              {customerData.referrals.slice(0, 5).map((ref, idx) => (
                <div key={idx} style={styles.referralItem}>
                  <span>{formatPhone(ref.phone)}</span>
                  <span style={styles.date}>{new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.info}>
            🎁 Refer {business?.referrals_needed_for_reward || 3} friends and get ${business?.referral_reward_amount || 10} off your next visit!
          </div>

          <button onClick={handleLogout} style={styles.secondaryButton}>
            Use Different Number
          </button>
        </div>
      )}

      {!phone && (
        <div style={styles.card}>
          <div style={styles.welcome}>
            <h3 style={styles.welcomeTitle}>
              {showRegister ? "Join Our Referral Program" : "Check Your Referrals"}
            </h3>
            <p style={styles.welcomeText}>
              {showRegister 
                ? "Enter your phone number to start earning rewards for referring friends!"
                : "Enter your phone number to see how many friends you've referred."}
            </p>
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="(555) 123-4567"
            style={styles.input}
            maxLength={14}
            inputMode="numeric"
            type="tel"
          />

          {showRegister && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>How did you hear about us?</label>
                <select 
                  value={source} 
                  onChange={(e) => setSource(e.target.value)}
                  style={styles.select}
                >
                  <option value="direct">Found you myself</option>
                  <option value="referral">Referred by a friend</option>
                  <option value="social">Social media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {source === 'referral' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Friend's Phone Number</label>
                  <input
                    value={referrerPhone}
                    onChange={(e) => setReferrerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="(555) 123-4567"
                    style={styles.input}
                    maxLength={14}
                    inputMode="numeric"
                    type="tel"
                  />
                </div>
              )}
            </>
          )}

          <button
            onClick={showRegister ? handleRegister : handleCheck}
            disabled={input.replace(/\D/g, '').length !== 10 || (showRegister && source === 'referral' && referrerPhone.replace(/\D/g, '').length !== 10)}
            style={{
              ...styles.primaryButton,
              backgroundColor: (input.replace(/\D/g, '').length === 10 && 
                             (source !== 'referral' || referrerPhone.replace(/\D/g, '').length === 10)) 
                             ? themeColor : "#ccc",
            }}
          >
            {showRegister ? "Join Now" : "Check My Referrals"}
          </button>

          <button
            onClick={() => {
              setShowRegister(!showRegister);
              setMessage(null);
            }}
            style={styles.linkButton}
          >
            {showRegister ? "Already a member? Check referrals" : "New here? Join now"}
          </button>
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
  message: {
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  section: {
    marginBottom: "25px",
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
  display: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    padding: "15px",
    border: "3px solid",
    borderRadius: "12px",
  },
  bigNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    textAlign: "center",
  },
  referralList: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  listTitle: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#374151",
  },
  referralItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "8px",
    marginBottom: "8px",
    fontSize: "14px",
  },
  date: {
    color: "#666",
    fontSize: "12px",
  },
  info: {
    background: "#f0f9ff",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#0369a1",
    marginBottom: "20px",
    lineHeight: "1.5",
    textAlign: "center",
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
  formGroup: {
    marginBottom: "15px",
  },
  formLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "15px",
    fontSize: "20px",
    textAlign: "center",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "15px",
    fontWeight
