document.addEventListener("DOMContentLoaded", () => {
  const projectImages = document.querySelectorAll(".project-image");
  console.log('Started hover-effect.js script')
  projectImages.forEach((image) => {
    let isAnimating = false;
    let leavePending = false;

    // Check if screen is mobile size (600px or less)
    const isMobile = () => window.innerWidth <= 600;

    const reset = () => {
      image.style.transform =
        "translateY(0) translateX(0) rotateZ(0deg) scale(1)";
      image.style.boxShadow = "0 0px 0px rgba(0, 0, 0, 0.0)";
    };

    const handleTransitionEnd = (event) => {
      // Only react to the transform transition ending
      if (event.propertyName !== "transform") return;
      isAnimating = false;
      image.removeEventListener("transitionend", handleTransitionEnd);
      if (leavePending) {
        leavePending = false;
        reset();
      }
    };

    const lift = () => {
      // Skip animation on mobile
      if (isMobile()) return;

      // Subtle random values
      const randomAngle = (Math.random() - 0.5) * 1; // ~-0.5deg..0.5deg
      const randomLift = 10 + Math.random(); // ~5px..6px
      const randomX = (Math.random() - 0.5) * 1; // ~-0.5px..0.5px

      isAnimating = true;
      image.addEventListener("transitionend", handleTransitionEnd);
      image.style.transform = `translateY(-${randomLift}px) translateX(${randomX}px) rotateZ(${randomAngle}deg) scale(1.01)`;
      image.style.boxShadow = `0 ${randomLift + 10}px 24px rgba(0, 0, 0, 0.05)`;
    };

    image.addEventListener("mouseenter", () => {
      // Skip on mobile
      if (isMobile()) return;

      leavePending = false;
      lift();
    });

    image.addEventListener("mouseleave", () => {
      // Skip on mobile
      if (isMobile()) return;

      if (isAnimating) {
        // Defer the reset until after the lift finishes
        leavePending = true;
      } else {
        reset();
      }
    });
  });
});
