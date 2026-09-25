/**
 * SafeSphere Back Button Component
 * Real browser/hash history navigation with visible back arrow
 */

export function renderBackButton(fallbackHash = "#/guides", customLabel = null) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-back";
  btn.setAttribute("aria-label", customLabel || "Go back to previous page");

  const label = customLabel || "Back";

  btn.innerHTML = `
    <svg class="back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
    <span>${label}</span>
  `;

  btn.addEventListener("click", () => {
    // If user arrived from within app, use browser history; otherwise fallback
    if (window.history.length > 1 && document.referrer.indexOf(window.location.host) !== -1) {
      window.history.back();
    } else {
      window.location.hash = fallbackHash;
    }
  });

  return btn;
}
