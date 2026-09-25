/**
 * SafeSphere Learning & Resources Page
 * Curated editorial publications on disaster preparedness,
 * first response physics, neighborhood networks, and psychological first aid.
 */

import { LEARNING_RESOURCES } from "../data.js";

export function renderLearning(mainElement) {
  let activeCategory = "All";
  let activeArticleId = null;

  mainElement.className = "page page-learning";

  function renderView() {
    if (activeArticleId) {
      renderArticleDetail();
    } else {
      renderArticleList();
    }
  }

  function renderArticleList() {
    const filtered = LEARNING_RESOURCES.filter(res => {
      return activeCategory === "All" || res.category === activeCategory;
    });

    mainElement.innerHTML = `
      <div class="content-container">
        <!-- Header -->
        <header class="page-header">
          <div class="header-pre">Knowledge & Resilience</div>
          <h1 class="page-title">Safety Learning Center</h1>
          <p class="page-lead">
            Curated, evidence-based articles covering trauma biology, domestic hazard blueprints,
            neighborhood mutual-aid networks, and disaster psychological stabilization.
          </p>
        </header>

        <!-- Category Tabs -->
        <div class="learning-filter-bar">
          <div class="category-filters" role="tablist">
            <button class="filter-chip ${activeCategory === 'All' ? 'active' : ''}" data-category="All">All Resources</button>
            <button class="filter-chip ${activeCategory === 'Disaster Preparedness' ? 'active' : ''}" data-category="Disaster Preparedness">Disaster Preparedness</button>
            <button class="filter-chip ${activeCategory === 'First Response Awareness' ? 'active' : ''}" data-category="First Response Awareness">First Response</button>
            <button class="filter-chip ${activeCategory === 'Family Safety' ? 'active' : ''}" data-category="Family Safety">Family Safety</button>
            <button class="filter-chip ${activeCategory === 'Community Safety' ? 'active' : ''}" data-category="Community Safety">Community Safety</button>
          </div>
        </div>

        <!-- Editorial Articles List -->
        <div class="learning-editorial-list">
          ${filtered.map(item => `
            <article class="editorial-article-card" data-id="${item.id}">
              <div class="article-meta">
                <span class="article-category">${item.category}</span>
                <span class="article-read-time">${item.readTime}</span>
              </div>
              <h2 class="article-title">${item.title}</h2>
              <p class="article-summary">${item.summary}</p>
              <div class="article-card-footer">
                <button class="btn-read-article" data-article-id="${item.id}">
                  <span>Read Article</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;

    // Filter chip listeners
    mainElement.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        activeCategory = chip.getAttribute("data-category");
        renderView();
      });
    });

    // Read article buttons
    mainElement.querySelectorAll(".btn-read-article").forEach(btn => {
      btn.addEventListener("click", () => {
        activeArticleId = btn.getAttribute("data-article-id");
        renderView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function renderArticleDetail() {
    const article = LEARNING_RESOURCES.find(a => a.id === activeArticleId) || LEARNING_RESOURCES[0];

    mainElement.innerHTML = `
      <div class="content-container article-detail-container">
        <!-- Back Button -->
        <div class="article-nav-bar">
          <button id="btn-back-to-learning" class="btn-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Back to All Resources</span>
          </button>
        </div>

        <article class="article-full-content">
          <header class="article-full-header">
            <div class="article-meta-large">
              <span class="article-category badge-primary">${article.category}</span>
              <span class="article-read-time">${article.readTime}</span>
            </div>
            <h1 class="article-full-title">${article.title}</h1>
            <p class="article-full-summary">${article.summary}</p>
          </header>

          <div class="article-body-text">
            ${article.content.trim().split("\n\n").map(paragraph => {
              if (paragraph.startsWith("- ")) {
                const bulletList = paragraph.split("\n").map(b => `<li>${b.replace(/^- /, "")}</li>`).join("");
                return `<ul>${bulletList}</ul>`;
              } else if (paragraph.match(/^\d+\./)) {
                const orderedList = paragraph.split("\n").map(o => `<li>${o.replace(/^\d+\.\s*/, "")}</li>`).join("");
                return `<ol>${orderedList}</ol>`;
              } else {
                return `<p>${paragraph}</p>`;
              }
            }).join("")}
          </div>

          <footer class="article-full-footer">
            <div class="article-cta-box">
              <h3>Put Knowledge into Practice</h3>
              <p>Preparedness requires action. Assemble your household supply kit or take the 8-question readiness assessment.</p>
              <div class="cta-actions">
                <a href="#/kit-planner" class="btn btn-primary btn-sm">Open Kit Planner</a>
                <a href="#/assessment" class="btn btn-outline btn-sm">Test Your Knowledge</a>
              </div>
            </div>
          </footer>
        </article>
      </div>
    `;

    mainElement.querySelector("#btn-back-to-learning").addEventListener("click", () => {
      activeArticleId = null;
      renderView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Initial render
  renderView();
}
