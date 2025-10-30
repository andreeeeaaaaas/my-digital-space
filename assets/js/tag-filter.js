document.addEventListener("DOMContentLoaded", function () {
  const tags = document.querySelectorAll(".tags .tag");
  const tagSquares = document.querySelectorAll(".mobile-controls .tag");
  const tagSquare = document.querySelectorAll(".filter .tag");
  const projects = document.querySelectorAll(".project");

  // Create X overlay for tag squares
  function createXOverlay() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("x-overlay");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");

    const line1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line1.setAttribute("x1", "3");
    line1.setAttribute("y1", "3");
    line1.setAttribute("x2", "17");
    line1.setAttribute("y2", "17");
    line1.setAttribute("stroke", "#ff6b6b");
    line1.setAttribute("stroke-width", "4");
    line1.setAttribute("stroke-linecap", "round");

    const line2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line2.setAttribute("x1", "17");
    line2.setAttribute("y1", "3");
    line2.setAttribute("x2", "3");
    line2.setAttribute("y2", "17");
    line2.setAttribute("stroke", "#ff6b6b");
    line2.setAttribute("stroke-width", "4");
    line2.setAttribute("stroke-linecap", "round");

    svg.appendChild(line1);
    svg.appendChild(line2);

    return svg;
  }

  // Add X overlay to each tag square
  tagSquare.forEach((square) => {
    const xOverlay = createXOverlay();
    square.appendChild(xOverlay);

    // Add hover event listeners
    square.addEventListener("mouseenter", () => {
      xOverlay.style.display = "block";
    });

    square.addEventListener("mouseleave", () => {
      const centerSquare = square.querySelector(".center-square");
      if (centerSquare) centerSquare.style.display = "block";
      xOverlay.style.display = "none";
    });
  });

  tags.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault();

      // Toggle the active state of this tag
      this.classList.toggle("active");
      this.classList.toggle("inactive");

      // Update mobile tag squares visibility
      updateMobileTagSquares();

      // Get all currently active tags
      const activeTags = Array.from(tags)
        .filter((t) => t.classList.contains("active"))
        .map((t) => (t.dataset.filter ? t.dataset.filter.toLowerCase() : null))
        .filter((filter) => filter !== null);

      // Filter projects based on active tags
      projects.forEach((project) => {
        // Split tags and trim whitespace from each tag
        const projectTags = project.dataset.tags
          .toLowerCase()
          .split(",")
          .map((tag) => tag.trim());

        // If no tags are active, show all projects
        // Otherwise, show projects that have at least one of the active tags
        const shouldShow =
          activeTags.length === 0 ||
          activeTags.every((activeTag) => projectTags.includes(activeTag));

        if (shouldShow) {
          project.classList.remove("inactive");
        } else {
          project.classList.add("inactive");
        }
      });
    });
  });

  // Add click functionality to mobile tag squares
  tagSquares.forEach((square) => {
    square.addEventListener("click", function (e) {
      e.preventDefault();

      const squareFilter = this.dataset.filter
        ? this.dataset.filter.toLowerCase()
        : null;

      if (squareFilter) {
        // Find the corresponding main tag and click it
        const correspondingTag = Array.from(tags).find(
          (tag) =>
            tag.dataset.filter &&
            tag.dataset.filter.toLowerCase() === squareFilter
        );

        if (correspondingTag) {
          correspondingTag.click(); // This will trigger the main tag's click handler
        }
      }
    });
  });

  // Function to update mobile tag squares visibility
  function updateMobileTagSquares() {
    const activeTags = Array.from(tags)
      .filter((t) => t.classList.contains("active"))
      .map((t) => (t.dataset.filter ? t.dataset.filter.toLowerCase() : null))
      .filter((filter) => filter !== null);

    // Update each mobile tag square
    tagSquares.forEach((square) => {
      const squareFilter = square.dataset.filter
        ? square.dataset.filter.toLowerCase()
        : null;

      if (squareFilter && activeTags.includes(squareFilter)) {
        // Show the square if its corresponding tag is active
        square.style.display = "flex";
      } else if (squareFilter) {
        // Hide the square if its corresponding tag is not active
        square.style.display = "none";
      }
    });
  }

  // Clickable spans
  const introSpans = document.querySelectorAll(".intro-text span");

  // Define additional texts for each filter
  const additionalTexts = {
    design: "I help organisations bring value to processes, products, and people through design.",
    music: " I make music using some eclectic electronic instruments.",
    visual: " I make films and take pictures of life happening around me.",
    writing: " Every now and then I write things down that interest me.",
  };

  introSpans.forEach((span) => {
    span.addEventListener("click", function () {
      const filter = span.className.trim().toLowerCase(); // e.g. 'designer'

      // Get the variable span
      const variableSpan = document.getElementById("variable");

      if (variableSpan && additionalTexts[filter]) {
        const additionalText = additionalTexts[filter];

        // Replace the text content
        variableSpan.textContent = additionalText;
      }

      // Find the tag button with matching filter
      tags.forEach((tag) => {
        if (tag.dataset.filter && tag.dataset.filter.toLowerCase() === filter) {
          tag.click(); // Simulate click on the tag button
        }
      });
    });
  });
});
