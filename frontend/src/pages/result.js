/**
 * SafeSphere Assessment Result Page
 * Clean, structured summary report with calculated readiness score,
 * category rating, and concrete recommendations.
 */

import { storage } from "../utils/storage.js";
import { renderBackButton } from "../components/backButton.js";

export function renderResult(mainElement) {
  const result = storage.get("latest_assessment");

  mainElement.className = "page page-result";

  if (!result) {
    mainElement.innerHTML = `
      <div class="content-container">
        <div class="result-empty-card">
          <div class="empty-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <h2 class="empty-title">No Assessment Completed Yet</h2>
          <p class="empty-text">Complete our 8-question preparedness evaluation to uncover gaps in your household safety plan and get tailored advice.</p>
          <a href="#/assessment" class="btn btn-primary btn-md">Start Assessment Now</a>
        </div>
      </div>
    `;
    return;
  }

  const { score, category, recommendations = [], completedAt } = result;

  let categoryBadgeClass = "badge-nature";
  let categoryMessage = "";

  if (category === "Needs Attention") {
    categoryBadgeClass = "badge-emergency";
    categoryMessage = "Your household is currently vulnerable to basic emergency disruptions. Focus on establishing a 3-day water supply, identifying gas shutoffs, and assembling a first aid kit.";
  } else if (category === "Getting Prepared") {
    categoryBadgeClass = "badge-warning";
    categoryMessage = "You have established several good safety fundamentals. Address the remaining gaps below to ensure resilience during prolonged power or municipal service interruptions.";
  } else {
    categoryBadgeClass = "badge-nature";
    categoryMessage = "Excellent readiness! Your household possesses high emergency resilience. Maintain this status by checking expiration dates twice a year and rehearsing exit routes.";
  }

  const dateStr = completedAt ? new Date(completedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }) : "Recent";

  mainElement.innerHTML = `
    <div class="content-container result-container">
      <!-- Back to assessment or home -->
      <div class="result-top-bar">
        <div id="result-back-slot"></div>
        <button id="result-print-btn" class="btn btn-outline btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Print Summary</span>
        </button>
      </div>

      <!-- Result Scorecard Hero -->
      <div class="result-hero-card">
        <div class="result-hero-left">
          <div class="result-score-circle">
            <span class="score-number">${score}%</span>
            <span class="score-label">Readiness Index</span>
          </div>
        </div>

        <div class="result-hero-right">
          <div class="result-badges-row">
            <span class="category-status-pill ${categoryBadgeClass}">${category}</span>
            <span class="result-date">Assessed on ${dateStr}</span>
          </div>
          <h1 class="result-title">Preparedness Diagnostic Report</h1>
          <p class="result-summary-text">${categoryMessage}</p>
          <div class="result-actions-inline">
            <a href="#/kit-planner" class="btn btn-primary btn-sm">
              <span>Assemble Custom Kit &rarr;</span>
            </a>
            <a href="#/assessment" class="btn btn-outline btn-sm">
              <span>Retake Evaluation</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Concrete Action Recommendations -->
      <section class="recommendations-section">
        <div class="section-header-compact">
          <h2 class="section-title">Priority Recommendations</h2>
          <p class="section-subtitle">
            ${recommendations.length > 0
              ? `We identified ${recommendations.length} key areas to improve your household survival security:`
              : "No critical gaps found! Keep your supplies up to date."}
          </p>
        </div>

        ${recommendations.length > 0 ? `
          <div class="recommendations-grid">
            ${recommendations.map((rec, i) => `
              <div class="rec-card rec-${rec.severity || 'medium'}">
                <div class="rec-header">
                  <span class="rec-num">0${i + 1}</span>
                  <span class="rec-badge ${rec.severity === 'high' ? 'badge-emergency' : 'badge-warning'}">
                    ${rec.severity === 'high' ? 'High Priority' : 'Action Recommended'}
                  </span>
                </div>
                <h3 class="rec-title">${rec.title}</h3>
                <p class="rec-tip">${rec.tip}</p>
              </div>
            `).join("")}
          </div>
        ` : `
          <div class="all-set-card">
            <div class="all-set-icon">&check;</div>
            <div class="all-set-text">
              <h3>All 8 Critical Indicators Verified</h3>
              <p>Your household has demonstrated readiness across water storage, emergency planning, first aid, and critical documents. Schedule your next supply check in 6 months.</p>
            </div>
          </div>
        `}
      </section>

      <!-- Next Steps Callouts -->
      <div class="result-next-steps">
        <div class="next-step-box">
          <div class="next-step-icon">📦</div>
          <div class="next-step-content">
            <h4>Step 1: Pack Your 72-Hour Kit</h4>
            <p>Use our interactive kit planner to calculate exact water and battery quotas based on your household size.</p>
            <a href="#/kit-planner" class="text-link">Go to Kit Planner &rarr;</a>
          </div>
        </div>

        <div class="next-step-box">
          <div class="next-step-icon">📖</div>
          <div class="next-step-content">
            <h4>Step 2: Review Emergency Protocols</h4>
            <p>Rehearse action sequences for fire evacuation and severe bleeding before an actual crisis happens.</p>
            <a href="#/guides" class="text-link">Browse Action Library &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach back button
  const backSlot = mainElement.querySelector("#result-back-slot");
  backSlot.appendChild(renderBackButton("#/assessment", "Back to Assessment"));

  // Print button
  const printBtn = mainElement.querySelector("#result-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}
