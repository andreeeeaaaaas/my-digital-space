document.addEventListener("DOMContentLoaded", function () {
  const tags = document.querySelectorAll(".tags .tag");
  const projects = document.querySelectorAll(".project");

  tags.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault();

      // Update active class on tags
      tags.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Get filter from data-filter attribute, or use "all" if not present
      const filter = this.dataset.filter ? this.dataset.filter.toLowerCase() : "all";

      projects.forEach((project) => {
        // Split tags and trim whitespace from each tag
        const projectTags = project.dataset.tags
          .toLowerCase()
          .split(",")
          .map(tag => tag.trim());

        if (filter === "all" || projectTags.includes(filter)) {
          project.classList.remove("inactive");
        } else {
          project.classList.add("inactive");
        }
      });
    });
  });
  
  // Clickable spans
  const introSpans = document.querySelectorAll(".intro-text span");

  introSpans.forEach((span) => {
    span.addEventListener("click", function () {
      const filter = span.className.trim().toLowerCase(); // e.g. 'designer'
      // Find the tag button with matching filter
      tags.forEach((tag) => {
        if (tag.dataset.filter && tag.dataset.filter.toLowerCase() === filter) {
          tag.click(); // Simulate click on the tag button
        }
      });
    });
  });
});