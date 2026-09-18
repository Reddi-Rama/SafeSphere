/**
 * SafeSphere Preparedness Assessment Page
 * 8 scenario-based interactive evaluation steps with real-time progress bar
 */

import { ASSESSMENT_QUESTIONS, TRANSLATIONS } from "../data.js";
import { storage } from "../utils/storage.js";
import { api } from "../api.js";

export function renderAssessment(mainElement) {
  const currentLang = storage.get("language", "en");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  let currentStep = 0;
  // user answers: array of { questionId, answer: "yes" | "no" | "notsure" }
  const answers = storage.get("assessment_draft", []);

  mainElement.className = "page page-assessment";
  mainElement.innerHTML = `
    <div class="content-container assessment-container">
      <!-- Header -->
      <header class="assessment-header">
        <div class="header-pre">${t.navAssessment}</div>
        <h1 class="page-title">Household Preparedness Evaluation</h1>
        <p class="page-lead">
          Answer 8 scenario-based questions to evaluate your family's readiness for common regional crises.
          Your responses identify critical survival gaps and generate a practical improvement checklist.
        </p>
      </header>

      <!-- Assessment Card Experience -->
      <div class="assessment-card" id="assessment-step-card">
        <!-- Progress Bar -->
        <div class="assessment-progress-wrapper">
          <div class="progress-labels">
            <span id="step-counter-label" class="step-counter-text">Question 1 of 8</span>
            <span id="step-percent-label" class="step-percent-text">12% Complete</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="8" aria-valuenow="1">
            <div id="progress-fill" class="progress-bar-fill" style="width: 12.5%;"></div>
          </div>
        </div>

        <!-- Question Body Area -->
        <div id="question-content-area" class="question-content-area">
          <!-- Rendered dynamically -->
        </div>

        <!-- Controls: Previous & Next/Submit -->
        <div class="assessment-actions-bar">
          <button id="assessment-prev-btn" class="btn btn-outline btn-md" disabled>
            &larr; Previous
          </button>
          <div class="assessment-action-right">
            <button id="assessment-next-btn" class="btn btn-primary btn-md" disabled>
              Next Question &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const questionArea = mainElement.querySelector("#question-content-area");
  const prevBtn = mainElement.querySelector("#assessment-prev-btn");
  const nextBtn = mainElement.querySelector("#assessment-next-btn");
  const stepLabel = mainElement.querySelector("#step-counter-label");
  const percentLabel = mainElement.querySelector("#step-percent-label");
  const progressFill = mainElement.querySelector("#progress-fill");

  function renderStep(index) {
    const q = ASSESSMENT_QUESTIONS[index];
    const total = ASSESSMENT_QUESTIONS.length;
    const existingAns = answers[index] ? answers[index].answer : null;

    // Update progress
    const pct = Math.round(((index + 1) / total) * 100);
    stepLabel.textContent = `Question ${index + 1} of ${total}`;
    percentLabel.textContent = `${pct}% Complete`;
    progressFill.style.width = `${pct}%`;

    // Render Question
    questionArea.innerHTML = `
      <div class="question-meta-badge">${q.category}</div>
      <h2 class="assessment-question-text">${q.question}</h2>

      <div class="why-matters-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div>
          <strong>Why this matters:</strong> ${q.whyItMatters}
        </div>
      </div>

      <fieldset class="answer-options-group">
        <legend class="sr-only">Choose your readiness status for this question</legend>

        <label class="answer-option ${existingAns === 'yes' ? 'selected' : ''}">
          <input type="radio" name="assessment_ans" value="yes" ${existingAns === 'yes' ? 'checked' : ''} />
          <div class="answer-option-ui">
            <span class="answer-radio-dot"></span>
            <div class="answer-text-wrap">
              <span class="answer-title">Yes, fully prepared</span>
              <span class="answer-sub">We have this tested, packed, or rehearsed.</span>
            </div>
          </div>
        </label>

        <label class="answer-option ${existingAns === 'no' ? 'selected' : ''}">
          <input type="radio" name="assessment_ans" value="no" ${existingAns === 'no' ? 'checked' : ''} />
          <div class="answer-option-ui">
            <span class="answer-radio-dot"></span>
            <div class="answer-text-wrap">
              <span class="answer-title">No, not yet</span>
              <span class="answer-sub">We do not have this in place or haven't planned for it.</span>
            </div>
          </div>
        </label>

        <label class="answer-option ${existingAns === 'notsure' ? 'selected' : ''}">
          <input type="radio" name="assessment_ans" value="notsure" ${existingAns === 'notsure' ? 'checked' : ''} />
          <div class="answer-option-ui">
            <span class="answer-radio-dot"></span>
            <div class="answer-text-wrap">
              <span class="answer-title">Not Sure / Partially</span>
              <span class="answer-sub">Some supplies exist or we are uncertain about details.</span>
            </div>
          </div>
        </label>
      </fieldset>
    `;

    // Button states
    prevBtn.disabled = index === 0;

    if (index === total - 1) {
      nextBtn.innerHTML = `<span>Calculate Results</span> &check;`;
    } else {
      nextBtn.innerHTML = `<span>Next Question</span> &rarr;`;
    }

    nextBtn.disabled = !existingAns;

    // Radio change handlers
    const radios = questionArea.querySelectorAll("input[type='radio']");
    radios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const val = e.target.value;
        answers[index] = {
          questionId: q.id,
          category: q.category,
          question: q.question,
          answer: val
        };
        storage.set("assessment_draft", answers);

        // Update selected class
        questionArea.querySelectorAll(".answer-option").forEach(opt => opt.classList.remove("selected"));
        radio.closest(".answer-option").classList.add("selected");

        nextBtn.disabled = false;
      });
    });
  }

  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
  });

  nextBtn.addEventListener("click", async () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      // Calculate score & finish
      await finishAssessment();
    }
  });

  async function finishAssessment() {
    nextBtn.disabled = true;
    nextBtn.textContent = "Calculating...";

    let scorePoints = 0;
    const maxPoints = ASSESSMENT_QUESTIONS.length * 2;
    const gaps = [];

    answers.forEach((ans, idx) => {
      const q = ASSESSMENT_QUESTIONS[idx];
      if (ans.answer === "yes") {
        scorePoints += 2;
      } else if (ans.answer === "notsure") {
        scorePoints += 1;
        gaps.push({
          questionId: q.id,
          category: q.category,
          tip: q.tip,
          severity: "medium",
          title: `Reinforce ${q.category}`
        });
      } else {
        // "no"
        gaps.push({
          questionId: q.id,
          category: q.category,
          tip: q.tip,
          severity: "high",
          title: `Address Missing ${q.category}`
        });
      }
    });

    const percentage = Math.round((scorePoints / maxPoints) * 100);

    let category = "Getting Prepared";
    if (percentage < 50) {
      category = "Needs Attention";
    } else if (percentage >= 80) {
      category = "Well Prepared";
    }

    const payload = {
      score: percentage,
      category,
      answers,
      recommendations: gaps,
      completedAt: new Date().toISOString()
    };

    // Submit to API or fallback to localStorage
    await api.submitAssessment(payload);

    // Clear draft
    storage.remove("assessment_draft");

    // Route to result page
    window.location.hash = "#/result";
  }

  // Initial render
  renderStep(currentStep);
}
