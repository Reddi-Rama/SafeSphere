/**
 * SafeSphere About Page
 * Platform mission, foundational thesis, architectural capabilities,
 * and academic engineering specifications.
 */

export function renderAbout(mainElement) {
  mainElement.className = "page page-about";
  mainElement.innerHTML = `
    <div class="content-container about-container">
      <!-- Header -->
      <header class="page-header text-center">
        <div class="header-pre">Origin & Architecture</div>
        <h1 class="page-title">Building Safer, Better-Prepared Communities</h1>
        <p class="page-lead">
          SafeSphere is an open, evidence-based emergency awareness and household resilience platform.
          Designed to convert panic into calm, rehearsed action before crisis strikes.
        </p>
      </header>

      <!-- Mission Statement Card -->
      <div class="about-hero-card">
        <div class="about-hero-badge">OUR CORE MISSION</div>
        <h2 class="about-mission-quote">
          "Democratize verified crisis knowledge, eliminate confusion during the golden hour of an emergency, and empower every household to achieve 72 hours of complete self-sufficiency."
        </h2>
      </div>

      <!-- Why SafeSphere Exists -->
      <section class="about-section">
        <div class="section-badge">THE PROBLEM</div>
        <h2 class="section-title">Why SafeSphere Exists</h2>
        <div class="about-prose-grid">
          <div class="prose-col">
            <h3 class="prose-h3">The Crisis Information Vacuum</h3>
            <p>
              When a disaster strikes—such as an earthquake, urban flood, or high-voltage electric shock—access to clean, authoritative information instantly degrades. Cell towers overload, panic rumors flood social channels, and generic search results return conflicting, verbose medical advice that nobody can read under duress.
            </p>
          </div>
          <div class="prose-col">
            <h3 class="prose-h3">The Power of Pre-Emptive Planning</h3>
            <p>
              Scientific disaster studies consistently demonstrate that survival during catastrophic events is determined not by luck, but by actions taken weeks and months beforehand: having 3 days of potable water, knowing the exact physical location of gas shutoffs, and storing vital papers in waterproof pouches. SafeSphere bridges the gap between awareness and execution.
            </p>
          </div>
        </div>
      </section>

      <!-- What The Platform Provides -->
      <section class="about-section">
        <div class="section-badge">CAPABILITIES</div>
        <h2 class="section-title">What the Platform Delivers</h2>
        <div class="about-features-grid">
          <div class="about-feature-item">
            <span class="af-num">01</span>
            <h4>Triage-Ordered Protocols</h4>
            <p>12 verified disaster and trauma guides organized strictly by immediate physical actions, explicit hazard avoidances, and hospital criteria.</p>
          </div>
          <div class="about-feature-item">
            <span class="af-num">02</span>
            <h4>Dynamic 72-Hour Supply Calculator</h4>
            <p>Algorithmic supply scaling factoring in adults, infants, elders, pets, and medical dependencies with instant browser storage and print layouts.</p>
          </div>
          <div class="about-feature-item">
            <span class="af-num">03</span>
            <h4>Auditory & Linguistic Accessibility</h4>
            <p>Integrated Web Speech Synthesis audio narration in English, Telugu, and Hindi, plus hands-free voice speech recognition for community surveys.</p>
          </div>
          <div class="about-feature-item">
            <span class="af-num">04</span>
            <h4>Zero-Delay Offline Resilience</h4>
            <p>Built-in localStorage fallbacks ensure that critical guides, assessment reports, and contact sheets remain fully readable without internet.</p>
          </div>
        </div>
      </section>

      <!-- Technology Stack (Viva-Friendly) -->
      <section class="about-section">
        <div class="section-badge">ENGINEERING SPECIFICATION</div>
        <h2 class="section-title">Academic & Technical Stack</h2>
        <p class="section-subtitle">
          Constructed with a lean, auditable architecture designed for high maintainability, rapid cold-starts, and clean viva presentation.
        </p>

        <div class="tech-stack-cards">
          <div class="tech-card">
            <span class="tech-category">Frontend Tier</span>
            <h4 class="tech-name">Vanilla JavaScript & HTML5</h4>
            <ul class="tech-list">
              <li><strong>Vite 6</strong> for zero-latency module bundling</li>
              <li><strong>Modern ES Modules</strong> without heavyweight framework overhead</li>
              <li><strong>Custom CSS3 Architecture</strong> with custom design tokens</li>
              <li><strong>Hash-Based Router</strong> with native browser history support</li>
              <li><strong>Web Speech API</strong> (Synthesis & Recognition)</li>
            </ul>
          </div>

          <div class="tech-card">
            <span class="tech-category">Backend Tier</span>
            <h4 class="tech-name">FastAPI & Python 3</h4>
            <ul class="tech-list">
              <li><strong>FastAPI</strong> for high-throughput asynchronous REST APIs</li>
              <li><strong>Pydantic v2</strong> for strict payload schema validation</li>
              <li><strong>Uvicorn ASGI</strong> web server worker runtime</li>
              <li><strong>Cross-Origin Resource Sharing (CORS)</strong> middleware</li>
            </ul>
          </div>

          <div class="tech-card">
            <span class="tech-category">Database Tier</span>
            <h4 class="tech-name">Supabase PostgreSQL</h4>
            <ul class="tech-list">
              <li><strong>PostgreSQL</strong> relational storage with UUID primary keys</li>
              <li><strong>Row Level Security (RLS)</strong> access policies</li>
              <li><strong>Schema DDL</strong> for guides, surveys, assessments & contacts</li>
              <li><strong>Automatic Fallback</strong> to browser client-side key-value cache</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Academic Disclaimer & Credits -->
      <div class="about-colophon">
        <p>
          SafeSphere is developed as a senior college project in Emergency Preparedness Informatics and Web Accessibility.
          All medical guidelines are aligned with established public health protocols.
        </p>
      </div>
    </div>
  `;
}
