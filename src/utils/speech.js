/**
 * SafeSphere Speech and Voice Accessibility Engine
 * Web Speech API wrapper for SpeechSynthesis & SpeechRecognition
 */

let activeUtterance = null;
let activeRecognition = null;

export const speech = {
  isSynthesisSupported() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  },

  isRecognitionSupported() {
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  },

  getLangCode(lang = "en") {
    switch (lang) {
      case "te":
        return "te-IN";
      case "hi":
        return "hi-IN";
      default:
        return "en-IN";
    }
  },

  speak(text, { lang = "en", onStart, onEnd, onError } = {}) {
    if (!this.isSynthesisSupported()) {
      if (onError) onError(new Error("Speech synthesis not supported in this browser."));
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = this.getLangCode(lang);
    utterance.lang = targetLang;
    utterance.rate = 0.95; // Calm, clear, measured cadence
    utterance.pitch = 1.0;

    // Attempt to pick matching Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      activeUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  },

  stop() {
    if (this.isSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    }
  },

  isPlaying() {
    return this.isSynthesisSupported() && window.speechSynthesis.speaking;
  },

  createRecognizer({ lang = "en", onResult, onError, onStart, onEnd } = {}) {
    if (!this.isRecognitionSupported()) {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();

    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = this.getLangCode(lang);

    recognizer.onstart = () => {
      activeRecognition = recognizer;
      if (onStart) onStart();
    };

    recognizer.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript, event.results[0].isFinal);
    };

    recognizer.onerror = (event) => {
      if (onError) onError(event);
    };

    recognizer.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    return recognizer;
  },

  stopRecognizer() {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch (e) {
        // already stopped
      }
      activeRecognition = null;
    }
  }
};
