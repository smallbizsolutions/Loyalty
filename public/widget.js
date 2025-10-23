(function() {
  const script = document.currentScript;
  const businessId = script.getAttribute("data-business");
  const iframe = document.createElement("iframe");
  iframe.src = `https://yourapp.com/widget?businessId=${businessId}`;
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "300px";
  iframe.style.height = "400px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  iframe.style.zIndex = "9999";
  document.body.appendChild(iframe);
})();
