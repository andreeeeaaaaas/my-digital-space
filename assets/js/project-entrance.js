(() => {
  const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
  const storageKey = "project-entrance:played";
  let hasAnimated = false;
  const entranceAnimations = [];

  function clearPendingState() {
    document.documentElement.classList.remove("project-entrance-pending");
  }

  function hasPlayedThisSession() {
    try {
      return sessionStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  }

  function rememberEntrance() {
    try {
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Keep the entrance working when browser storage is unavailable.
    }
  }

  function animateProjects() {
    if (hasAnimated || hasPlayedThisSession()) {
      clearPendingState();
      return;
    }

    const projects = document.querySelectorAll(".project-grid .project");
    if (!projects.length) {
      clearPendingState();
      return;
    }

    hasAnimated = true;
    rememberEntrance();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    projects.forEach((project, index) => {
      const keyframes = reduceMotion
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ];

      entranceAnimations.push(
        project.animate(keyframes, {
          duration: reduceMotion ? 180 : 520,
          delay: reduceMotion ? 0 : 400 + Math.min(index, 8) * 90,
          easing: easeOut,
          fill: "backwards",
        })
      );
    });

    clearPendingState();
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    entranceAnimations.forEach((animation) => animation.cancel());
    clearPendingState();
  });

  function initialiseEntrance() {
    requestAnimationFrame(animateProjects);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseEntrance, {
      once: true,
    });
  } else {
    initialiseEntrance();
  }
})();
