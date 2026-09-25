/**
 * SafeSphere Hash Router
 * Native, resilient hash routing supporting browser back/forward, route params & transitions
 */

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
    this.previousRoute = null;
    this.init();
  }

  init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    window.addEventListener("load", () => this.handleRoute());
  }

  navigate(path) {
    if (!path.startsWith("#")) {
      path = "#" + path;
    }
    window.location.hash = path;
  }

  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate("#/home");
    }
  }

  getHash() {
    const hash = window.location.hash || "#/home";
    return hash.replace(/^#\/?/, "");
  }

  handleRoute() {
    const rawPath = this.getHash();
    if (!rawPath || rawPath === "") {
      window.location.hash = "#/home";
      return;
    }

    const segments = rawPath.split("/").filter(Boolean);
    const primary = segments[0] || "home";
    const param = segments[1] || null;

    this.previousRoute = this.currentRoute;
    this.currentRoute = { path: rawPath, primary, param };

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "instant" });

    // Match routes
    let matchedHandler = null;

    if (primary === "guide" && param) {
      matchedHandler = this.routes["/guide/:id"];
    } else {
      matchedHandler = this.routes["/" + primary] || this.routes["/home"];
    }

    if (matchedHandler) {
      matchedHandler({ param, fullPath: rawPath });
    } else if (this.routes["/home"]) {
      this.routes["/home"]({});
    }

    // Broadcast route change event
    window.dispatchEvent(new CustomEvent("safesphere:routechange", {
      detail: { route: this.currentRoute }
    }));
  }
}
