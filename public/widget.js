(function() {
  const script = document.currentScript;
  const businessId = script.getAttribute("data-business");
  
  // Replace with your actual Railway URL
  const WIDGET_URL = "https://loyalty-production-f3f5.up.railway.app";
  
  const iframe = document.createElement("iframe");
  iframe.src = `${WIDGET_URL}?businessId=${businessId}`;
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "380px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
  iframe.style.zIndex = "9999";
  iframe.style.transition = "all 0.3s ease";
  
  // Add a toggle button
  const button = document.createElement("button");
  button.innerHTML = "🎁 Rewards";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.padding = "12px 20px";
  button.style.background = "#6366f1";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "25px";
  button.style.fontSize = "16px";
  button.style.fontWeight = "600";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 4px 12px rgba(99,102,241,0.4)";
  button.style.zIndex = "10000";
  button.style.transition = "all 0.3s ease";
  
  button.onmouseover = () => {
    button.style.transform = "scale(1.05)";
    button.style.boxShadow = "0 6px 16px rgba(99,102,241,0.5)";
  };
  
  button.onmouseout = () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "0 4px 12px rgba(99,102,241,0.4)";
  };
  
  let isOpen = false;
  iframe.style.display = "none";
  
  button.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.style.display = "block";
      button.style.display = "none";
    } else {
      iframe.style.display = "none";
      button.style.display = "block";
    }
  };
  
  // Close button inside iframe messaging
  window.addEventListener("message", (event) => {
    if (event.data === "close-widget") {
      isOpen = false;
      iframe.style.display = "none";
      button.style.display = "block";
    }
  });
  
  document.body.appendChild(button);
  document.body.appendChild(iframe);
})();
