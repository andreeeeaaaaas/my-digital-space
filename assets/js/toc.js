(function () {
  const article = document.querySelector("article");
  const toc = document.querySelector("[data-toc]");
  if (!article || !toc) return;

  const headings = [...article.querySelectorAll("h2, h3")];
  if (headings.length < 2) {
    toc.remove();
    return;
  }

  headings.forEach((h) => {
    if (!h.id) {
      h.id = h.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  });

  const list = document.createElement("ul");
  headings.forEach((h) => {
    const li = document.createElement("li");
    li.className = "toc-item toc-" + h.tagName.toLowerCase();
    const a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  toc.appendChild(list);
  toc.hidden = false;

  const links = new Map(
    [...toc.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a])
  );

  function updateActive() {
    const trigger = 120;
    let current = headings[0].id;
    for (const h of headings) {
      if (h.getBoundingClientRect().top - trigger <= 0) current = h.id;
      else break;
    }
    links.forEach((l) => l.classList.remove("active"));
    links.get(current)?.classList.add("active");
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  updateActive();
})();
