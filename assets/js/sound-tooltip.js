document.addEventListener("DOMContentLoaded", function () {
  // Check if tooltip has already been shown
  if (localStorage.getItem('soundTooltipShown')) {
    return;
  }

  // Wait a bit for the page to fully load
  setTimeout(() => {
    const soundToggle = document.getElementById("sound-toggle");
    
    if (!soundToggle) {
      return;
    }

    // Create the tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "sound-tooltip";
    tooltip.textContent = "Explore with sound - it's fun!";
    
    // Insert the tooltip after the sound toggle
    soundToggle.parentNode.insertBefore(tooltip, soundToggle.nextSibling);
    
    // Debug: Log to console to verify tooltip is created
    console.log("Tooltip created:", tooltip);

    // Show tooltip with fade-in effect
    setTimeout(() => {
      console.log("Showing tooltip, opacity:", tooltip.style.opacity);
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateX(-50%) translateY(0)";
      console.log("Tooltip styles after show:", {
        opacity: tooltip.style.opacity,
        transform: tooltip.style.transform
      });
    }, 100);

    // Hide tooltip after 4 seconds
    setTimeout(() => {
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateX(-50%) translateY(-10px)";
      
      // Remove tooltip after fade out and mark as shown
      setTimeout(() => {
        tooltip.remove();
        localStorage.setItem('soundTooltipShown', 'true');
      }, 300);
    }, 4000);
  }, 1500); // Wait 1.5 seconds after page load
});
