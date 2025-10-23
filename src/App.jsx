import React, { useState, useEffect } from "react";

export default function App({ businessId }) {
  const [status, setStatus] = useState("Loading...");
  const [loyaltyId, setLoyaltyId] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`App started with businessId: ${businessId}`);
    testAPI();
  }, [businessId]);

  const testAPI = async () => {
    try {
      addLog("Testing business API...");
      const res = await fetch(`/api/business/${businessId}`);
      addLog(`Business API response status: ${res.status}`);
      
      if (res.ok) {
        const data = await res.json();
        addLog(`Business loaded: ${data.name}`);
        setStatus(`Connected to: ${data.name}`);
      } else {
        const text = await res.text();
        addLog(`Business API error: ${text}`);
        setError(`Failed to load business: ${res.status}`);
      }
    } catch (err) {
      addLog(`Business API exception: ${err.message}`);
      setError(`Network error: ${err.message}`);
    }
  };

  const handleCreateClick = async () => {
    addLog("Create button clicked!");
    setError(null);
    
    try {
      addLog(`Calling POST /api/loyalty/create with businessId: ${businessId}`);
      
      const response = await fetch("/api/loyalty/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId: businessId }),
      });

      addLog(`Create API response status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Create API response data: ${JSON.stringify(data)}`);

      if (response.ok && data.loyaltyId) {
        addLog(`SUCCESS! Loyalty ID created: ${data.loyaltyId}`);
        setLoyaltyId(data.loyaltyId);
        localStorage.setItem("loyaltyId", data.loyaltyId);
      } else {
        addLog(`Create failed: ${JSON.stringify(data)}`);
        setError(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      addLog(`Create exception: ${err.message}`);
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <h2>Loyalty Widget Debug</h2>
      
      <div style={{ 
        background: "#f0f0f0", 
        padding: "10px", 
        borderRadius: "5px",
        marginBottom: "20px"
      }}>
        <strong>Status:</strong> {status}
        <br />
        <strong>Business ID:</strong> {businessId}
      </div>

      {error && (
        <div style={{ 
          background: "#ffebee", 
          color: "#c62828",
          padding: "10px", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          ❌ {error}
        </div>
      )}

      {loyaltyId ? (
        <div style={{ 
          background: "#e8f5e9", 
          color: "#2e7d32",
          padding: "15px", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <h3>✅ Success!</h3>
          <p>Your Loyalty ID: <strong style={{ fontSize: "1.5em" }}>{loyaltyId}</strong></p>
          <button 
            onClick={() => {
              localStorage.removeItem("loyaltyId");
              setLoyaltyId(null);
              addLog("Logged out");
            }}
            style={{
              background: "#666",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Reset
          </button>
        </div>
      ) : (
        <div>
          <button 
            onClick={handleCreateClick}
            style={{
              background: "#6366f1",
              color: "white",
              border: "none",
              padding: "15px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Generate My Loyalty ID
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: "30px",
        background: "#fafafa",
        padding: "15px",
        borderRadius: "5px",
        maxHeight: "300px",
        overflow: "auto"
      }}>
        <h4>Debug Logs:</h4>
        {logs.map((log, i) => (
          <div key={i} style={{ 
            fontSize: "12px", 
            fontFamily: "monospace",
            padding: "2px 0",
            borderBottom: "1px solid #eee"
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
