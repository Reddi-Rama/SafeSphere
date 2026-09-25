/**
 * SafeSphere Guide Detail Page
 * Reading, SpeechSynthesis audio narration (en-IN, te-IN, hi-IN),
 * and educational visual demonstration player.
 */

import { GUIDES, TRANSLATIONS } from "../data.js";
import { renderBackButton } from "../components/backButton.js";
import { speech } from "../utils/speech.js";
import { storage } from "../utils/storage.js";
import { showToast } from "../components/toast.js";

export function renderGuideDetail(mainElement, guideId) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];
  const currentIndex = GUIDES.findIndex(g => g.id === guide.id);
  const prevGuide = currentIndex > 0 ? GUIDES[currentIndex - 1] : null;
  const nextGuide = currentIndex < GUIDES.length - 1 ? GUIDES[currentIndex + 1] : null;

  mainElement.className = "page page-guide-detail";
  mainElement.innerHTML = `
    <div class="content-container guide-detail-container">
      <!-- Navigation & Top Bar -->
      <div class="guide-nav-bar">
        <div id="back-button-slot"></div>
        <div class="guide-mode-pills" role="tablist" aria-label="Content presentation mode">
          <button id="mode-read" class="mode-pill active" role="tab" aria-selected="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Read</span>
          </button>
          <button id="mode-listen" class="mode-pill" role="tab" aria-selected="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span>Listen</span>
          </button>
          <button id="mode-watch" class="mode-pill" role="tab" aria-selected="false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span>Watch</span>
          </button>
        </div>
      </div>

      <!-- Guide Header -->
      <header class="guide-header">
        <div class="guide-header-badges">
          <span class="guide-category-badge badge-primary">${guide.category}</span>
          <span class="guide-id-code">PROTOCOL #${guide.id.toUpperCase()}</span>
        </div>
        <h1 class="guide-title">${guide.title}</h1>
        <p class="guide-lead">${guide.shortDescription}</p>
      </header>

      <!-- Audio Player Control Panel (Shown when Listen clicked or active) -->
      <div id="audio-panel" class="audio-panel hidden" aria-live="polite">
        <div class="audio-panel-inner">
          <div class="audio-panel-info">
            <div class="audio-pulse-indicator" id="audio-indicator"></div>
            <div>
              <strong class="audio-status-text" id="audio-status">Speech synthesis ready</strong>
              <p class="audio-sub">Language: <strong>${speech.getLangCode(currentLang)}</strong> (Cadence: 0.95x clear emergency cadence)</p>
            </div>
          </div>
          <div class="audio-panel-buttons">
            <button id="audio-play-btn" class="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Play Narration</span>
            </button>
            <button id="audio-stop-btn" class="btn btn-outline btn-sm hidden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
              <span>Stop</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Video Demonstration Panel (Shown when Watch clicked) -->
      <div id="video-panel" class="video-panel hidden">
        <div class="video-card">
          <div class="video-player-wrapper">
            <video id="emergency-video" class="emergency-video" controls preload="metadata" poster="">
              <source src="/assets/videos/emergency-placeholder.mp4" type="video/mp4">
              Your browser does not support HTML5 video.
            </video>
            <!-- Graceful Fallback if video file is not found -->
            <div id="video-fallback" class="video-fallback hidden">
              <div class="fallback-visual">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                </svg>
              </div>
              <h3 class="fallback-title">Visual Action Sequence</h3>
              <p class="fallback-desc">Step-by-step interactive demonstration for <strong>${guide.title}</strong>.</p>
              <div class="fallback-steps-preview">
                <span class="step-pill">1. Identify Danger</span>
                <span class="step-pill">2. Take Cover / Isolate</span>
                <span class="step-pill">3. Apply First Response</span>
                <span class="step-pill">4. Notify 112</span>
              </div>
            </div>
          </div>
          <p class="video-caption">Educational non-graphic demonstration. Practice these drills during household safety walkthroughs.</p>
        </div>
      </div>

      <!-- Critical Key Reminder Box (Urgent Triage) -->
      <aside class="key-reminder-card" aria-label="Key safety reminder">
        <div class="reminder-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="reminder-content">
          <span class="reminder-label">${t.keyReminder}</span>
          <p class="reminder-text">"${guide.keySafetyReminder}"</p>
        </div>
      </aside>

      <!-- Section: What It Is -->
      <section class="guide-section">
        <h2 class="guide-section-title">
          <span class="section-title-num">01</span>
          ${t.whatItIs}
        </h2>
        <div class="guide-text-body">
          <p>${guide.whatItIs}</p>
        </div>
      </section>

      <!-- Section: Immediate Actions (Ordered sequence) -->
      <section class="guide-section">
        <h2 class="guide-section-title">
          <span class="section-title-num">02</span>
          ${t.immediateActions}
        </h2>
        <ol class="action-steps-list">
          ${guide.immediateActions.map((step, idx) => `
            <li class="action-step-item">
              <span class="step-counter">${idx + 1}</span>
              <div class="step-body">
                <p class="step-instruction">${step}</p>
              </div>
            </li>
          `).join("")}
        </ol>
      </section>

      <!-- Section: What to Avoid -->
      <section class="guide-section">
        <h2 class="guide-section-title title-warning">
          <span class="section-title-num">03</span>
          ${t.whatToAvoid}
        </h2>
        <div class="avoidance-card">
          <ul class="avoidance-list">
            ${guide.whatToAvoid.map(item => `
              <li class="avoidance-item">
                <span class="avoidance-icon">&times;</span>
                <span class="avoidance-text">${item}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </section>

      <!-- Two-Column Response Matrix: Help & Emergency Contacts -->
      <div class="guide-matrix-grid">
        <!-- Professional Help Criteria -->
        <section class="matrix-card">
          <div class="matrix-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <h3 class="matrix-title">${t.whenToSeekHelp}</h3>
          </div>
          <p class="matrix-desc">${guide.whenToSeekHelp}</p>
        </section>

        <!-- Direct Emergency Action Line -->
        <section class="matrix-card matrix-emergency">
          <div class="matrix-card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <h3 class="matrix-title">${t.emergencyContact}</h3>
          </div>
          <div class="matrix-hotline-box">
            <span class="hotline-notice">${guide.emergencyContact}</span>
            <div class="hotline-btn-row">
              <a href="tel:112" class="btn btn-emergency btn-sm">Dial 112 (All-Hazards)</a>
              <a href="tel:108" class="btn btn-secondary btn-sm">Dial 108 (Medical)</a>
            </div>
          </div>
        </section>
      </div>

      <!-- Prev / Next Navigation Footer -->
      <nav class="guide-pagination" aria-label="Next or previous emergency guide">
        ${prevGuide ? `
          <a href="#/guide/${prevGuide.id}" class="guide-pag-link prev">
            <span class="pag-dir">&larr; Previous Guide</span>
            <span class="pag-title">${prevGuide.title}</span>
          </a>
        ` : `<div></div>`}

        ${nextGuide ? `
          <a href="#/guide/${nextGuide.id}" class="guide-pag-link next">
            <span class="pag-dir">Next Guide &rarr;</span>
            <span class="pag-title">${nextGuide.title}</span>
          </a>
        ` : `<div></div>`}
      </nav>
    </div>
  `;

  // Attach Back Button
  const backSlot = mainElement.querySelector("#back-button-slot");
  backSlot.appendChild(renderBackButton("#/guides", "Back to Guides"));

  // Video fallback listener
  const videoEl = mainElement.querySelector("#emergency-video");
  const fallbackEl = mainElement.querySelector("#video-fallback");
  if (videoEl) {
    videoEl.addEventListener("error", () => {
      videoEl.style.display = "none";
      fallbackEl.classList.remove("hidden");
    });
  }

  // Presentation Mode Switcher (Read / Listen / Watch)
  const modeRead = mainElement.querySelector("#mode-read");
  const modeListen = mainElement.querySelector("#mode-listen");
  const modeWatch = mainElement.querySelector("#mode-watch");
  const audioPanel = mainElement.querySelector("#audio-panel");
  const videoPanel = mainElement.querySelector("#video-panel");
  const audioIndicator = mainElement.querySelector("#audio-indicator");
  const audioStatus = mainElement.querySelector("#audio-status");
  const playBtn = mainElement.querySelector("#audio-play-btn");
  const stopBtn = mainElement.querySelector("#audio-stop-btn");

  function resetModePills() {
    [modeRead, modeListen, modeWatch].forEach(pill => {
      pill.classList.remove("active");
      pill.setAttribute("aria-selected", "false");
    });
  }

  modeRead.addEventListener("click", () => {
    resetModePills();
    modeRead.classList.add("active");
    modeRead.setAttribute("aria-selected", "true");
    audioPanel.classList.add("hidden");
    videoPanel.classList.add("hidden");
    speech.stop();
  });

  modeListen.addEventListener("click", () => {
    resetModePills();
    modeListen.classList.add("active");
    modeListen.setAttribute("aria-selected", "true");
    audioPanel.classList.remove("hidden");
    videoPanel.classList.add("hidden");
    startNarration();
  });

  modeWatch.addEventListener("click", () => {
    resetModePills();
    modeWatch.classList.add("active");
    modeWatch.setAttribute("aria-selected", "true");
    videoPanel.classList.remove("hidden");
    audioPanel.classList.add("hidden");
    speech.stop();
  });

  // Speech narration setup
  function getFullNarrationText() {
    return `Emergency guide for ${guide.title}. Key safety reminder: ${guide.keySafetyReminder}. Immediate actions: ${guide.immediateActions.join(". ")}. What to avoid: ${guide.whatToAvoid.join(". ")}. Emergency contact: ${guide.emergencyContact}.`;
  }

  function startNarration() {
    if (!speech.isSynthesisSupported()) {
      showToast("Speech synthesis is not supported in this browser.", "warning");
      return;
    }

    audioIndicator.classList.add("pulsing");
    audioStatus.textContent = "Narrating emergency instructions...";
    playBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");

    speech.speak(getFullNarrationText(), {
      lang: currentLang,
      onStart: () => {
        audioIndicator.classList.add("pulsing");
        audioStatus.textContent = "Narrating emergency instructions...";
      },
      onEnd: () => {
        audioIndicator.classList.remove("pulsing");
        audioStatus.textContent = "Narration completed.";
        playBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
      },
      onError: () => {
        audioIndicator.classList.remove("pulsing");
        audioStatus.textContent = "Narration paused or ended.";
        playBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
      }
    });
  }

  playBtn.addEventListener("click", startNarration);

  stopBtn.addEventListener("click", () => {
    speech.stop();
    audioIndicator.classList.remove("pulsing");
    audioStatus.textContent = "Narration stopped.";
    playBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
  });

  // Stop speech if navigating away
  const stopOnLeave = () => {
    speech.stop();
    window.removeEventListener("safesphere:routechange", stopOnLeave);
  };
  window.addEventListener("safesphere:routechange", stopOnLeave);
}
