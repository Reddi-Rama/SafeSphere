/**
 * SafeSphere Preparedness Analytics Page
 * Community preparedness data storytelling with Chart.js,
 * clearly labeled demonstration figures, and responsive charts.
 */

import { DEMO_ANALYTICS } from "../data.js";
import { api } from "../api.js";
import { getTheme } from "../utils/theme.js";

export async function renderAnalytics(mainElement) {
  mainElement.className = "page page-analytics";
  mainElement.innerHTML = `
    <div class="content-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-pre">Community Preparedness Insights</div>
        <h1 class="page-title">Readiness Analytics & Trends</h1>
        <p class="page-lead">
          Visualizing household preparedness indices, dominant disaster concerns, and 72-hour kit adoption across surveyed households.
        </p>
      </header>

      <!-- Explicit Demo Data Label Banner -->
      <div class="analytics-notice-banner">
        <div class="notice-badge">DEMO DATA</div>
        <p class="notice-text">
          <strong>Academic & Demonstration Notice:</strong> The statistics and chart datasets presented on this page are generated from educational baseline models and simulated community feedback to demonstrate analytical capabilities for research and college viva evaluation.
        </p>
      </div>

      <!-- High-Level Metric Tiles (Not generic SaaS, but safety-focused) -->
      <div class="analytics-stat-grid">
        <div class="stat-card">
          <span class="stat-label">Total Survey Responses</span>
          <span class="stat-value" id="stat-total-surveys">1,428</span>
          <span class="stat-context">Across urban & suburban households</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Average Preparedness Score</span>
          <span class="stat-value text-primary">68.4%</span>
          <span class="stat-context">Readiness Index baseline</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Vulnerable Households</span>
          <span class="stat-value text-emergency">32%</span>
          <span class="stat-context">Require immediate water / gas safety plan</span>
        </div>

        <div class="stat-card">
          <span class="stat-label">Primary Disaster Concern</span>
          <span class="stat-value text-secondary">Flooding</span>
          <span class="stat-context">Reported by 34% of respondents</span>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="analytics-charts-grid">
        <!-- Chart 1: Preparedness Distribution -->
        <div class="chart-box">
          <div class="chart-header">
            <h2 class="chart-title">Preparedness Rating Distribution</h2>
            <span class="chart-tag">Household Triage</span>
          </div>
          <p class="chart-desc">Breakdown of completed assessments into three operational readiness tiers.</p>
          <div class="chart-canvas-wrapper">
            <canvas id="chart-distribution" height="260"></canvas>
          </div>
        </div>

        <!-- Chart 2: Top Hazard Concerns -->
        <div class="chart-box">
          <div class="chart-header">
            <h2 class="chart-title">Top Reported Hazard Concerns</h2>
            <span class="chart-tag">Survey Responses</span>
          </div>
          <p class="chart-desc">Which emergency situations create the greatest household anxiety.</p>
          <div class="chart-canvas-wrapper">
            <canvas id="chart-concerns" height="260"></canvas>
          </div>
        </div>

        <!-- Chart 3: Kit Supplies Completion Rate -->
        <div class="chart-box">
          <div class="chart-header">
            <h2 class="chart-title">72-Hour Supply Adoption Rate (%)</h2>
            <span class="chart-tag">Kit Planner Data</span>
          </div>
          <p class="chart-desc">Percentage of households that actively possess these critical supplies.</p>
          <div class="chart-canvas-wrapper">
            <canvas id="chart-kit" height="260"></canvas>
          </div>
        </div>

        <!-- Chart 4: Language Preference for Emergency Alerts -->
        <div class="chart-box">
          <div class="chart-header">
            <h2 class="chart-title">Emergency Language Accessibility</h2>
            <span class="chart-tag">Regional Reach</span>
          </div>
          <p class="chart-desc">Preferred communication medium for disaster alerts and guides.</p>
          <div class="chart-canvas-wrapper">
            <canvas id="chart-languages" height="260"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  // Fetch remote analytics or fallback
  const data = await api.getAnalytics();

  // Initialize Chart.js
  initCharts(data);
}

function initCharts(data) {
  // Check if Chart.js is loaded from CDN or global
  const Chart = window.Chart;

  if (!Chart) {
    console.warn("Chart.js is loading or unavailable, rendering styled visual fallback.");
    renderFallbackVisuals(data);
    return;
  }

  const isDark = getTheme() === "dark";
  const textColor = isDark ? "#94A3B8" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

  // Chart 1: Distribution
  const ctxDist = document.getElementById("chart-distribution");
  if (ctxDist) {
    new Chart(ctxDist, {
      type: "doughnut",
      data: {
        labels: ["Needs Attention (0-49%)", "Getting Prepared (50-79%)", "Well Prepared (80-100%)"],
        datasets: [{
          data: [data.scoreDistribution.needsAttention, data.scoreDistribution.gettingPrepared, data.scoreDistribution.wellPrepared],
          backgroundColor: ["#DC6B6B", "#D97706", "#16A34A"],
          borderColor: isDark ? "#131C2E" : "#FFFFFF",
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, padding: 16, font: { family: "inherit", size: 12 } }
          }
        },
        cutout: "68%"
      }
    });
  }

  // Chart 2: Concerns
  const ctxConcerns = document.getElementById("chart-concerns");
  if (ctxConcerns) {
    new Chart(ctxConcerns, {
      type: "bar",
      data: {
        labels: data.emergencyConcerns.map(c => c.name),
        datasets: [{
          label: "Reported Count",
          data: data.emergencyConcerns.map(c => c.count),
          backgroundColor: "#2563EB",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor }
          }
        }
      }
    });
  }

  // Chart 3: Kit readiness
  const ctxKit = document.getElementById("chart-kit");
  if (ctxKit) {
    new Chart(ctxKit, {
      type: "bar",
      data: {
        labels: data.kitItemReadiness.map(k => k.item),
        datasets: [{
          label: "% Households Prepared",
          data: data.kitItemReadiness.map(k => k.packed),
          backgroundColor: "#0F766E",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (v) => v + "%"
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor, maxRotation: 25, minRotation: 20 }
          }
        }
      }
    });
  }

  // Chart 4: Language
  const ctxLang = document.getElementById("chart-languages");
  if (ctxLang) {
    new Chart(ctxLang, {
      type: "pie",
      data: {
        labels: data.languageUsage.map(l => l.lang),
        datasets: [{
          data: data.languageUsage.map(l => l.share),
          backgroundColor: ["#2563EB", "#0F766E", "#7C3AED"],
          borderColor: isDark ? "#131C2E" : "#FFFFFF",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, padding: 14 }
          }
        }
      }
    });
  }
}

function renderFallbackVisuals(data) {
  // In the rare event Chart.js CDN is unreachable, render elegant semantic SVG/HTML bar charts
  const wrappers = document.querySelectorAll(".chart-canvas-wrapper");
  if (wrappers[0]) {
    wrappers[0].innerHTML = `
      <div class="fallback-chart-bars">
        <div class="f-bar-row"><span class="f-label">Needs Attention</span><div class="f-track"><div class="f-fill" style="width: 32%; background: #DC6B6B;">32%</div></div></div>
        <div class="f-bar-row"><span class="f-label">Getting Prepared</span><div class="f-track"><div class="f-fill" style="width: 46%; background: #D97706;">46%</div></div></div>
        <div class="f-bar-row"><span class="f-label">Well Prepared</span><div class="f-track"><div class="f-fill" style="width: 22%; background: #16A34A;">22%</div></div></div>
      </div>
    `;
  }
}
