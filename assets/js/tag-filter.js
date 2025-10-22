document.addEventListener("DOMContentLoaded", function () {
  const tags = document.querySelectorAll(".tags .tag");
  const projects = document.querySelectorAll(".project");

  tags.forEach((tag) => {
    tag.addEventListener("click", function (e) {
      e.preventDefault();

      // Toggle the active state of this tag
      this.classList.toggle("active");

      // Get all currently active tags
      const activeTags = Array.from(tags)
        .filter(t => t.classList.contains("active"))
        .map(t => t.dataset.filter ? t.dataset.filter.toLowerCase() : null)
        .filter(filter => filter !== null);

      // Filter projects based on active tags
      projects.forEach((project) => {
        // Split tags and trim whitespace from each tag
        const projectTags = project.dataset.tags
          .toLowerCase()
          .split(",")
          .map(tag => tag.trim());

        // If no tags are active, show all projects
        // Otherwise, show projects that have at least one of the active tags
        const shouldShow = activeTags.length === 0 || 
          activeTags.every(activeTag => projectTags.includes(activeTag));

        if (shouldShow) {
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