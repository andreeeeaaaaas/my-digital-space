// View toggle logic
document.addEventListener("DOMContentLoaded", function () {
  const gridIcon = document.querySelector("#grid-button");
  const listIcon = document.querySelector("#list-button");
  const projectGrid = document.querySelector(".project-grid");
  const mobileViewButton = document.querySelector(".mobile-controls .view");
  const mobileViewIcon = mobileViewButton.querySelector("div");
  const mobileViewText =
    mobileViewButton.querySelector("span") || mobileViewButton.childNodes[2]; // Text node

  // Function to update mobile view button appearance
  function updateMobileViewButton(isListView) {
    if (isListView) {
      // Update to show list view
      mobileViewIcon.style.display = "flex";
      mobileViewIcon.style.flexDirection = "column";
      mobileViewIcon.style.gap = "2px";
      mobileViewIcon.style.borderStyle = "none";
      mobileViewIcon.innerHTML = `
        <div style="display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    flex: 1 0 0;
    align-self: stretch;
    border-style: solid;
    border-width: 1.5px;"></div>
    <div style="display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    flex: 1 0 0;
    align-self: stretch;
    border-style: solid;
    border-width: 1.5px;"></div>
      `;
      mobileViewText.textContent = "List";
    } else {
      // Update to show grid view
      mobileViewIcon.style.display = "flex";
      mobileViewIcon.style.flexDirection = "column";
      mobileViewIcon.style.gap = "2px";
      mobileViewIcon.style.borderStyle = "solid";
      mobileViewIcon.innerHTML = ``;
      mobileViewText.textContent = "Grid";
    }
  }

  // Function to toggle view
  function toggleView() {
    const isCurrentlyListView = projectGrid.classList.contains("list-view");

    if (isCurrentlyListView) {
      // Switch to grid view
      projectGrid.classList.remove("list-view");
      if (gridIcon) gridIcon.classList.add("active");
      if (listIcon) listIcon.classList.remove("active");
      updateMobileViewButton(false);
    } else {
      // Switch to list view
      projectGrid.classList.add("list-view");
      if (listIcon) listIcon.classList.add("active");
      if (gridIcon) gridIcon.classList.remove("active");
      updateMobileViewButton(true);
    }
  }

  // Desktop view controls
  if (gridIcon && listIcon) {
    gridIcon.addEventListener("click", function () {
      gridIcon.classList.add("active");
      listIcon.classList.remove("active");
      projectGrid.classList.remove("list-view");
      updateMobileViewButton(false);
    });

    listIcon.addEventListener("click", function () {
      listIcon.classList.add("active");
      gridIcon.classList.remove("active");
      projectGrid.classList.add("list-view");
      updateMobileViewButton(true);
    });
  }

  // Mobile controls toggle
  const filterButton = document.querySelector(".mobile-controls .filter");
  const viewButton = document.querySelector(".mobile-controls .view");
  const toolbarTags = document.querySelector(".toolbar .tags");
  const toolbarViewControls = document.querySelector(".toolbar .view-controls");

  if (filterButton && viewButton && toolbarTags && toolbarViewControls) {
    filterButton.addEventListener("click", function () {
      // Toggle tags visibility
      toolbarTags.classList.toggle("visible");
      // Hide view-controls
      toolbarViewControls.classList.remove("visible");
      // Toggle active state on filterButton
      filterButton.classList.toggle("active");
      // Remove active state from viewButton
      viewButton.classList.remove("active");
    });

    viewButton.addEventListener("click", function () {
      // If view-controls are visible, toggle the view
      // Otherwise, show view-controls
      toolbarViewControls.classList.toggle("visible");
      toolbarTags.classList.remove("visible");
      viewButton.classList.toggle("active");
      filterButton.classList.remove("active");
    });
  }

  // Initialize mobile view button state
  updateMobileViewButton(projectGrid.classList.contains("list-view"));
});
