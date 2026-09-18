/**
 * SafeSphere Community Preparedness Survey
 * Structured feedback form with live speech recognition input & offline fallback
 */

import { api } from "../api.js";
import { speech } from "../utils/speech.js";
import { storage } from "../utils/storage.js";
import { showToast } from "../components/toast.js";

export function renderSurvey(mainElement) {
  const currentLang = storage.get("language", "en");

  mainElement.className = "page page-survey";
  mainElement.innerHTML = `
    <div class="content-container survey-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-pre">Community Feedback</div>
        <h1 class="page-title">Preparedness Feedback Survey</h1>
        <p class="page-lead">
          Help us measure real-world community readiness and identify emerging safety challenges.
          Responses are aggregated to improve safety guidelines and municipal resource recommendations.
        </p>
      </header>

      <!-- Survey Form Card -->
      <div class="survey-card" id="survey-form-wrapper">
        <form id="community-survey-form" class="survey-form">

          <!-- Q1: Confidence -->
          <div class="survey-question-block">
            <label class="survey-label">1. How confident do you feel about handling a sudden domestic or environmental crisis?</label>
            <div class="survey-radio-group">
              <label class="radio-pill">
                <input type="radio" name="confidence" value="Very Confident" required />
                <span>Very Confident</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="confidence" value="Moderately Confident" />
                <span>Moderately Confident</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="confidence" value="Slightly Confident" />
                <span>Slightly Confident</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="confidence" value="Not Confident At All" />
                <span>Not Confident At All</span>
              </label>
            </div>
          </div>

          <!-- Q2: Emergency Kit -->
          <div class="survey-question-block">
            <label class="survey-label">2. Does your home currently have an assembled emergency supply kit?</label>
            <div class="survey-radio-group">
              <label class="radio-pill">
                <input type="radio" name="hasKit" value="Yes, Complete 72-Hour Kit" required />
                <span>Yes, Complete 72-Hour Kit</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="hasKit" value="Partially (Some supplies)" />
                <span>Partially (Some supplies)</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="hasKit" value="No, Nothing Prepared" />
                <span>No, Nothing Prepared</span>
              </label>
            </div>
          </div>

          <!-- Q3: Emergency Numbers -->
          <div class="survey-question-block">
            <label class="survey-label">3. Can you recite the primary emergency response numbers (112 / 108 / 101) from memory?</label>
            <div class="survey-radio-group">
              <label class="radio-pill">
                <input type="radio" name="knowsNumbers" value="Yes, All of Them" required />
                <span>Yes, All of Them</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="knowsNumbers" value="Only 1 or 2" />
                <span>Only 1 or 2</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="knowsNumbers" value="Not Sure" />
                <span>Not Sure</span>
              </label>
            </div>
          </div>

          <!-- Q4: Safety Training -->
          <div class="survey-question-block">
            <label class="survey-label">4. Have you ever received formal first aid, CPR, or disaster preparedness training?</label>
            <div class="survey-radio-group">
              <label class="radio-pill">
                <input type="radio" name="training" value="Yes, Recently (past 2 yrs)" required />
                <span>Yes, Recently (&lt; 2 yrs)</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="training" value="Yes, Long Ago (> 2 yrs)" />
                <span>Yes, Long Ago (&gt; 2 yrs)</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="training" value="Never Received Training" />
                <span>Never Received Training</span>
              </label>
            </div>
          </div>

          <!-- Q5: Family Emergency Plan -->
          <div class="survey-question-block">
            <label class="survey-label">5. Does your family have an agreed-upon evacuation meeting spot and communication plan?</label>
            <div class="survey-radio-group">
              <label class="radio-pill">
                <input type="radio" name="familyPlan" value="Yes, Clear Plan" required />
                <span>Yes, Clear Plan</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="familyPlan" value="Discussed Informally" />
                <span>Discussed Informally</span>
              </label>
              <label class="radio-pill">
                <input type="radio" name="familyPlan" value="No Plan in Place" />
                <span>No Plan in Place</span>
              </label>
            </div>
          </div>

          <!-- Q6: Primary Concerns (Multi-select) -->
          <div class="survey-question-block">
            <label class="survey-label">6. Which emergency situations are you most concerned about in your locality? (Select all that apply)</label>
            <div class="survey-checkbox-grid">
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Fire" />
                <span>Fire & Smoke</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Flood" />
                <span>Urban Flooding</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Earthquake" />
                <span>Earthquake</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Medical Emergency" />
                <span>Medical Emergency</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Electric Shock" />
                <span>Electric Shock</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Snake / Animal Bite" />
                <span>Snake / Animal Bite</span>
              </label>
              <label class="checkbox-chip">
                <input type="checkbox" name="concerns" value="Other" />
                <span>Other Hazard</span>
              </label>
            </div>
          </div>

          <!-- Q7: Freeform Feedback with Voice Input -->
          <div class="survey-question-block">
            <div class="voice-label-row">
              <label for="feedback-text" class="survey-label">7. What additional tools or safety information would make your family feel safer?</label>
              <!-- Speech Recognition Button -->
              <button type="button" id="voice-input-btn" class="btn-voice-input" title="Use microphone for voice feedback">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
                <span id="voice-btn-text">Voice Input</span>
              </button>
            </div>

            <div id="voice-status-banner" class="voice-status-banner hidden">
              <div class="voice-pulsing-circle"></div>
              <span id="voice-status-message">Listening... Speak clearly into your microphone</span>
              <button type="button" id="voice-stop-btn" class="btn-text">Stop</button>
            </div>

            <textarea
              id="feedback-text"
              name="feedbackText"
              rows="4"
              class="form-textarea"
              placeholder="Type or speak your thoughts (e.g. need better regional flood mapping, school drills, neighborhood first aid workshops)..."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="survey-submit-row">
            <button type="submit" id="survey-submit-btn" class="btn btn-primary btn-lg">
              Submit Survey Response
            </button>
            <p class="submit-privacy-note">
              No private identity details required. Your responses contribute to our community analytics.
            </p>
          </div>
        </form>
      </div>

      <!-- Submission Success State (Hidden initially) -->
      <div id="survey-success-card" class="survey-success-card hidden">
        <div class="success-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="success-title">Thank You For Contributing!</h2>
        <p class="success-text">
          Your feedback has been recorded. Aggregated data informs community preparedness reports and helps emergency planners identify safety priorities.
        </p>
        <div class="success-actions">
          <a href="#/analytics" class="btn btn-primary btn-md">View Community Analytics</a>
          <a href="#/home" class="btn btn-outline btn-md">Return to Home</a>
        </div>
      </div>
    </div>
  `;

  const form = mainElement.querySelector("#community-survey-form");
  const formWrapper = mainElement.querySelector("#survey-form-wrapper");
  const successCard = mainElement.querySelector("#survey-success-card");
  const submitBtn = mainElement.querySelector("#survey-submit-btn");
  const textarea = mainElement.querySelector("#feedback-text");
  const voiceBtn = mainElement.querySelector("#voice-input-btn");
  const voiceBtnText = mainElement.querySelector("#voice-btn-text");
  const voiceBanner = mainElement.querySelector("#voice-status-banner");
  const voiceStopBtn = mainElement.querySelector("#voice-stop-btn");

  // Radio and checkbox styling updates
  form.querySelectorAll("input[type='radio']").forEach(radio => {
    radio.addEventListener("change", () => {
      const groupName = radio.name;
      form.querySelectorAll(`input[name='${groupName}']`).forEach(r => {
        r.closest(".radio-pill").classList.remove("selected");
      });
      radio.closest(".radio-pill").classList.add("selected");
    });
  });

  form.querySelectorAll("input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      const chip = chk.closest(".checkbox-chip");
      if (chk.checked) chip.classList.add("selected");
      else chip.classList.remove("selected");
    });
  });

  // Voice Input Logic
  let recognizer = null;
  let isRecording = false;

  if (!speech.isRecognitionSupported()) {
    voiceBtn.title = "Voice recognition is not supported in this browser";
    voiceBtn.style.opacity = "0.6";
  }

  function startVoiceRecording() {
    if (!speech.isRecognitionSupported()) {
      showToast("Speech recognition is not supported in this browser. Please type your feedback.", "info");
      return;
    }

    try {
      recognizer = speech.createRecognizer({
        lang: currentLang,
        onStart: () => {
          isRecording = true;
          voiceBtn.classList.add("is-recording");
          voiceBtnText.textContent = "Listening...";
          voiceBanner.classList.remove("hidden");
        },
        onResult: (transcript) => {
          textarea.value = transcript;
        },
        onError: (err) => {
          console.warn("[SafeSphere Voice] Error:", err);
          stopVoiceRecording();
          showToast("Microphone access unavailable or quiet. You can type directly.", "info");
        },
        onEnd: () => {
          stopVoiceRecording();
        }
      });

      if (recognizer) {
        recognizer.start();
      }
    } catch (e) {
      console.warn("Failed to start speech recognizer", e);
      stopVoiceRecording();
    }
  }

  function stopVoiceRecording() {
    isRecording = false;
    speech.stopRecognizer();
    voiceBtn.classList.remove("is-recording");
    voiceBtnText.textContent = "Voice Input";
    voiceBanner.classList.add("hidden");
  }

  voiceBtn.addEventListener("click", () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });

  voiceStopBtn.addEventListener("click", stopVoiceRecording);

  // Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    stopVoiceRecording();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = new FormData(form);
    const concerns = [];
    form.querySelectorAll("input[name='concerns']:checked").forEach(c => concerns.push(c.value));

    const payload = {
      confidence: formData.get("confidence"),
      hasKit: formData.get("hasKit"),
      knowsNumbers: formData.get("knowsNumbers"),
      training: formData.get("training"),
      familyPlan: formData.get("familyPlan"),
      concerns,
      feedbackText: formData.get("feedbackText") || "",
      language: currentLang,
      submittedAt: new Date().toISOString()
    };

    await api.submitSurvey(payload);

    formWrapper.classList.add("hidden");
    successCard.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
