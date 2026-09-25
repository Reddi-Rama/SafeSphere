/**
 * SafeSphere Emergency Guides Page
 * Searchable, filterable 12-guide library with category pills and clean responsive layout
 */

import { GUIDES, TRANSLATIONS } from "../data.js";
import { storage } from "../utils/storage.js";

export function renderGuides(mainElement) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  let activeCategory = "All";
  let searchQuery = "";

  mainElement.className = "page page-guides";
  mainElement.innerHTML = `
    <div class="content-container">
      <!-- Guides Header -->
      <header class="page-header">
        <div class="header-pre">${t.navGuides}</div>
        <h1 class="page-title">Emergency Action Library</h1>
        <p class="page-lead">
          Verified, step-by-step crisis instructions for common natural hazards, trauma emergencies, and domestic accidents. Select any guide for detailed procedures, precautions, and emergency contacts.
        </p>
      </header>

      <!-- Search & Filters Toolbar -->
      <div class="library-toolbar">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            id="guide-search-input"
            class="search-input"
            placeholder="${t.searchPlaceholder}"
            aria-label="Search emergency guides"
          />
          <button id="guide-search-clear" class="search-clear hidden" aria-label="Clear search input">&times;</button>
        </div>

        <div class="category-filters" role="tablist" aria-label="Filter guides by category">
          <button class="filter-chip active" data-category="All" role="tab" aria-selected="true">${t.allCategories}</button>
          <button class="filter-chip" data-category="Natural Disasters" role="tab" aria-selected="false">${t.naturalDisasters}</button>
          <button class="filter-chip" data-category="Medical" role="tab" aria-selected="false">${t.medical}</button>
          <button class="filter-chip" data-category="Accidents" role="tab" aria-selected="false">${t.accidents}</button>
        </div>
      </div>

      <!-- Guides Counter & Stats -->
      <div class="guides-meta-bar">
        <span id="guides-count-label" class="guides-count">Showing 12 emergency protocols</span>
        <span class="guides-hint">Ordered by immediate life-safety priority</span>
      </div>

      <!-- Guides Grid Container -->
      <div id="guides-grid" class="guides-grid">
        <!-- Rendered dynamically -->
      </div>

      <!-- Empty State -->
      <div id="guides-empty" class="guides-empty hidden">
        <div class="empty-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3 class="empty-title">No matching guides found</h3>
        <p class="empty-text">We couldn't find any emergency protocol matching your keyword. Try searching for "fire", "flood", "bleeding", or switch category to "All".</p>
        <button id="reset-search-btn" class="btn btn-secondary btn-sm">Reset Filters</button>
      </div>
    </div>
  `;

  const searchInput = mainElement.querySelector("#guide-search-input");
  const clearBtn = mainElement.querySelector("#guide-search-clear");
  const filterChips = mainElement.querySelectorAll(".filter-chip");
  const grid = mainElement.querySelector("#guides-grid");
  const emptyState = mainElement.querySelector("#guides-empty");
  const countLabel = mainElement.querySelector("#guides-count-label");
  const resetBtn = mainElement.querySelector("#reset-search-btn");

  function getCategoryBadgeClass(category) {
    switch (category) {
      case "Natural Disasters":
        return "badge-nature";
      case "Medical":
        return "badge-medical";
      case "Accidents":
        return "badge-accidents";
      default:
        return "badge-default";
    }
  }

  function getGuideIconSvg(iconName) {
    // Clean SVG icons for each guide
    switch (iconName) {
      case "flame":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
      case "activity":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
      case "droplets":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
      case "sun":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
      case "shield-alert":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      case "heart-pulse":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`;
      case "zap":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
      case "heart":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      case "cloud-lightning":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m13 12-3 5h4l-3 5"/></svg>`;
      case "alert-triangle":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      case "skull":
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`;
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    }
  }

  function filterAndRender() {
    const q = searchQuery.trim().toLowerCase();
    const filtered = GUIDES.filter(guide => {
      const matchCat = activeCategory === "All" || guide.category === activeCategory;
      const matchQuery = !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.shortDescription.toLowerCase().includes(q) ||
        guide.whatItIs.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    countLabel.textContent = `Showing ${filtered.length} of ${GUIDES.length} emergency protocols`;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
      grid.innerHTML = filtered.map(guide => `
        <article class="guide-card" data-id="${guide.id}">
          <div class="guide-card-top">
            <div class="guide-icon-wrapper">
              ${getGuideIconSvg(guide.icon)}
            </div>
            <span class="guide-category-badge ${getCategoryBadgeClass(guide.category)}">${guide.category}</span>
          </div>

          <h2 class="guide-card-title">${guide.title}</h2>
          <p class="guide-card-desc">${guide.shortDescription}</p>

          <div class="guide-card-footer">
            <a href="#/guide/${guide.id}" class="btn-read-guide" aria-label="Read protocol for ${guide.title}">
              <span>${t.readGuide}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </article>
      `).join("");
    }
  }

  // Event handlers
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (searchQuery.length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
    filterAndRender();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearBtn.classList.add("hidden");
    searchInput.focus();
    filterAndRender();
  });

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-selected", "true");
      activeCategory = chip.getAttribute("data-category");
      filterAndRender();
    });
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearBtn.classList.add("hidden");
    activeCategory = "All";
    filterChips.forEach(c => {
      if (c.getAttribute("data-category") === "All") {
        c.classList.add("active");
        c.setAttribute("aria-selected", "true");
      } else {
        c.classList.remove("active");
        c.setAttribute("aria-selected", "false");
      }
    });
    filterAndRender();
  });

  // Initial render
  filterAndRender();
}
