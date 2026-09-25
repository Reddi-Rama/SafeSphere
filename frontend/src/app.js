/**
 * SafeSphere Application Orchestrator
 * Mounts components, handles multilingual state, initializes hash router
 */

import { initTheme } from "./utils/theme.js";
import { Router } from "./utils/router.js";
import { renderNavbar } from "./components/navbar.js";
import { renderFooter } from "./components/footer.js";

// Page modules
import { renderHome } from "./pages/home.js";
import { renderGuides } from "./pages/guides.js";
import { renderGuideDetail } from "./pages/guideDetail.js";
import { renderAssessment } from "./pages/assessment.js";
import { renderResult } from "./pages/result.js";
import { renderKitPlanner } from "./pages/kitPlanner.js";
import { renderLearning } from "./pages/learning.js";
import { renderSurvey } from "./pages/survey.js";
import { renderContacts } from "./pages/contacts.js";
import { renderAnalytics } from "./pages/analytics.js";
import { renderAbout } from "./pages/about.js";
import { renderAuth } from "./pages/auth.js";
import { renderProfile } from "./pages/profile.js";
import { renderEmergencyHelp } from "./pages/emergencyHelp.js";
import { renderCommunityHelp } from "./pages/communityHelp.js";

export function initApp() {
  // 1. Initialize Theme (Light/Dark with persistent localStorage)
  initTheme();

  // 2. DOM Mount Points
  const headerContainer = document.getElementById("header-container");
  const mainContainer = document.getElementById("main-container");
  const footerContainer = document.getElementById("footer-container");

  // 3. Mount Navbar & Footer
  function updateShell() {
    renderNavbar(headerContainer, (newLang) => {
      // On language change, refresh shell and current view
      updateShell();
      if (router && router.currentRoute) {
        router.handleRoute();
      }
    });
    renderFooter(footerContainer);
  }

  updateShell();

  // 4. Register Routes
  const routes = {
    "/home": () => renderHome(mainContainer),
    "/guides": () => renderGuides(mainContainer),
    "/guide/:id": ({ param }) => renderGuideDetail(mainContainer, param),
    "/assessment": () => renderAssessment(mainContainer),
    "/result": () => renderResult(mainContainer),
    "/kit-planner": () => renderKitPlanner(mainContainer),
    "/learning": () => renderLearning(mainContainer),
    "/survey": () => renderSurvey(mainContainer),
    "/contacts": () => renderContacts(mainContainer),
    "/analytics": () => renderAnalytics(mainContainer),
    "/about": () => renderAbout(mainContainer),
    "/auth": () => renderAuth(mainContainer),
    "/profile": () => renderProfile(mainContainer),
    "/emergency-help": () => renderEmergencyHelp(mainContainer),
    "/community-help": () => renderCommunityHelp(mainContainer),
    "/personal-contacts": () => renderProfile(mainContainer)
  };

  // 5. Initialize Router
  const router = new Router(routes);

  // 6. Update body data attributes on route change for page-specific background system
  window.addEventListener("safesphere:routechange", (e) => {
    const route = e.detail && e.detail.route;
    if (route) {
      document.body.setAttribute("data-page", route.primary);
      // Remove any lingering voice recognizer or audio on navigation
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  });

  return router;
}
