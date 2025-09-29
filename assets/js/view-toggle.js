// View toggle logic
document.addEventListener("DOMContentLoaded", function () {
  const gridIcon = document.querySelector(".grid-icon");
  const listIcon = document.querySelector(".list-icon");
  const projectGrid = document.querySelector(".project-grid");

  gridIcon.addEventListener("click", function () {
    gridIcon.classList.add("active");
    listIcon.classList.remove("active");
    projectGrid.classList.remove("list-view");
  });

  listIcon.addEventListener("click", function () {
    listIcon.classList.add("active");
    gridIcon.classList.remove("active");
    projectGrid.classList.add("list-view");
  });
});
