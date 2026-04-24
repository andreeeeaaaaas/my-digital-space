document.addEventListener("DOMContentLoaded", function () {
  const tags = document.querySelectorAll(".tags .tag");
  const allBtn = document.querySelector('.tags .tag[data-filter="all"]');
  const categoryTags = document.querySelectorAll('.tags .tag:not([data-filter="all"])');
  const projects = document.querySelectorAll(".project");

  function applyFilter() {
    const activeCategories = Array.from(categoryTags)
      .filter((t) => t.classList.contains("active"))
      .map((t) => t.dataset.filter.toLowerCase());

    projects.forEach((project) => {
      const projectTags = (project.dataset.tags || "")
        .toLowerCase()
        .split(",")
        .map((t) => t.trim());

      const shouldShow =
        activeCategories.length === 0 ||
        activeCategories.every((f) => projectTags.includes(f));

      project.classList.toggle("inactive", !shouldShow);
    });
  }

  if (allBtn) {
    allBtn.addEventListener("click", function () {
      categoryTags.forEach((t) => { t.classList.remove("active"); t.classList.add("inactive"); });
      allBtn.classList.add("active");
      allBtn.classList.remove("inactive");
      applyFilter();
    });
  }

  categoryTags.forEach((tag) => {
    tag.addEventListener("click", function () {
      this.classList.toggle("active");
      this.classList.toggle("inactive");

      const anyActive = Array.from(categoryTags).some((t) => t.classList.contains("active"));
      if (allBtn) {
        allBtn.classList.toggle("active", !anyActive);
        allBtn.classList.toggle("inactive", anyActive);
      }

      applyFilter();
    });
  });

  // Clickable spans
  const introSpans = document.querySelectorAll(".intro-text span");

  // Define additional texts for each filter
  const additionalTexts = {
    design: "I help organisations bring value to processes, products, and people through design",
    music: "I make music using some eclectic electronic instruments",
    visual: "I make films and take pictures of life happening around me",
    writing: "Every now and then I write things down that interest me",
  };

  // Typewriter for #variable span
  const variableSpan = document.getElementById("variable");
  const typewriterTexts = Object.values(additionalTexts);
  const speed = 50;
  const deleteSpeed = 30;
  const waitTime = 3000;
  const typoChance = 0.04;

  let twIndex = 0;
  let twCharIndex = 0;
  let twDeleting = false;
  let twTimeout = null;
  let typoState = "none"; // none | drift | rewind
  let typoStartLength = 0;
  let typoRestoreIndex = 0;
  let typoCharsUntilFix = 4;
  let wordsSincePause = 0;
  let nextPauseAfterWords = 1 + Math.floor(Math.random() * 4); // 1-4 words

  function getVisibleText() {
    const textNode = variableSpan.childNodes[0];
    return textNode ? textNode.nodeValue : "";
  }

  function setVisibleText(value) {
    const textNode = variableSpan.childNodes[0];
    if (textNode) {
      textNode.nodeValue = value;
    } else {
      variableSpan.prepend(document.createTextNode(value));
    }
  }

  const qwertyNeighbors = {
    a: "qwsz",
    b: "vghn",
    c: "xdfv",
    d: "erfcxs",
    e: "rdsw",
    f: "rtgvcd",
    g: "tyhbvf",
    h: "yujnbg",
    i: "okju",
    j: "uikmnh",
    k: "iolm,j",
    l: "op.;,k",
    m: "njk,",
    n: "bhjm",
    o: "plki",
    p: "[;lo",
    q: "wa",
    r: "tfde",
    s: "wedxza",
    t: "ygfr",
    u: "ijhy",
    v: "cfgb",
    w: "qase",
    x: "zsdc",
    y: "uhgt",
    z: "asx",
  };

  function nearbyKey(char) {
    const lowerChar = (char || "").toLowerCase();
    const neighbors = qwertyNeighbors[lowerChar];

    if (!neighbors || neighbors.length === 0) {
      const letters = "abcdefghijklmnopqrstuvwxyz";
      return letters[Math.floor(Math.random() * letters.length)];
    }

    const picked = neighbors[Math.floor(Math.random() * neighbors.length)];
    return /[A-Z]/.test(char) ? picked.toUpperCase() : picked;
  }

  function getHumanizedDelay(currentText, isDeleting = false, extraPause = 0) {
    const base = isDeleting ? deleteSpeed : speed;
    const variance = isDeleting ? 10 : 35;
    const lastChar = currentText.slice(-1);

    // Small random fluctuation for each tick.
    let delay = base + Math.floor((Math.random() - 0.5) * variance * 2);

    // Add natural pauses after punctuation, similar to real typing cadence.
    if (!isDeleting && /[.,!?;:]/.test(lastChar)) {
      delay += 140 + Math.floor(Math.random() * 100);
    } else if (!isDeleting && /\s/.test(lastChar)) {
      delay += 25 + Math.floor(Math.random() * 30);
    }

    return Math.max(isDeleting ? 12 : 22, delay + extraPause);
  }

  function typewriterTick() {
    const current = typewriterTexts[twIndex];

    if (twDeleting) {
      const current_text = getVisibleText();
      if (current_text.length > 0) {
        setVisibleText(current_text.slice(0, -1));
        twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), true));
      } else {
        twDeleting = false;
        twIndex = (twIndex + 1) % typewriterTexts.length;
        twCharIndex = 0;
        typoState = "none";
        wordsSincePause = 0;
        nextPauseAfterWords = 2 + Math.floor(Math.random() * 4);
        twTimeout = setTimeout(typewriterTick, getHumanizedDelay("", false));
      }
    } else {
      if (typoState === "rewind") {
        const visibleText = getVisibleText();
        if (visibleText.length > typoStartLength) {
          setVisibleText(visibleText.slice(0, -1));
          twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), true, 20));
        } else {
          typoState = "none";
          twCharIndex = typoRestoreIndex;
          twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), false, 70));
        }
        return;
      }

      if (twCharIndex < current.length) {
        const visibleText = getVisibleText();

        const nextChar = current.charAt(twCharIndex);

        if (typoState === "drift") {
          setVisibleText(visibleText + nextChar);
          twCharIndex++;
          typoCharsUntilFix--;

          const reachedEnd = twCharIndex >= current.length;
          const reachedWordBoundary = !/[a-z]/i.test(current.charAt(twCharIndex));
          if (typoCharsUntilFix <= 0 || reachedEnd || reachedWordBoundary) {
            typoState = "rewind";
            twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), false, 100));
          } else {
            twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), false));
          }
          return;
        }

        const prevChar = twCharIndex > 0 ? current.charAt(twCharIndex - 1) : "";
        const followingChar = twCharIndex + 1 < current.length ? current.charAt(twCharIndex + 1) : "";
        const isMidWordPosition = /[a-z]/i.test(prevChar) && /[a-z]/i.test(nextChar) && /[a-z]/i.test(followingChar);
        const shouldMakeTypo = isMidWordPosition && Math.random() < typoChance;

        if (shouldMakeTypo) {
          const wrongChar = nearbyKey(nextChar);
          setVisibleText(visibleText + wrongChar);
          typoState = "drift";
          typoStartLength = visibleText.length;
          typoRestoreIndex = twCharIndex;
          twCharIndex++; // Skip the intended character and continue typing forward.
          typoCharsUntilFix = 1 + Math.floor(Math.random() * 3); // Keep typing 1-3 more chars.
          twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), false, 20));
          return;
        }

        setVisibleText(visibleText + nextChar);
        twCharIndex++;

        let extraPause = 0;
        const justTypedSpace = nextChar === " " && /\S$/.test(visibleText);
        if (justTypedSpace) {
          wordsSincePause++;
          if (wordsSincePause >= nextPauseAfterWords) {
            extraPause += 120 + Math.floor(Math.random() * 180);
            wordsSincePause = 0;
            nextPauseAfterWords = 2 + Math.floor(Math.random() * 4);
          }
        }

        twTimeout = setTimeout(typewriterTick, getHumanizedDelay(getVisibleText(), false, extraPause));
      } else {
        twTimeout = setTimeout(() => {
          twDeleting = true;
          typewriterTick();
        }, waitTime);
      }
    }
  }

  function startTypewriter() {
    clearTimeout(twTimeout);
    // Clear to text node only (preserve cursor span)
    const textNode = variableSpan.childNodes[0];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.nodeValue = "";
    } else {
      variableSpan.prepend(document.createTextNode(""));
    }
    twCharIndex = 0;
    twDeleting = false;
    typoState = "none";
    wordsSincePause = 0;
    nextPauseAfterWords = 2 + Math.floor(Math.random() * 4);
    twTimeout = setTimeout(typewriterTick, getHumanizedDelay("", false));
  }

  // Ensure variableSpan has a text node and a cursor span
  if (typeof initializeTypewriterCursor === "function") {
    initializeTypewriterCursor(variableSpan, "_");
  } else {
    variableSpan.innerHTML = "";
    variableSpan.prepend(document.createTextNode(""));
    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    cursor.textContent = "_";
    variableSpan.appendChild(cursor);
  }

  startTypewriter();

  introSpans.forEach((span) => {
    span.addEventListener("click", function () {
      const filter = span.className.trim().toLowerCase();

      tags.forEach((tag) => {
        if (tag.dataset.filter && tag.dataset.filter.toLowerCase() === filter) {
          tag.click();
        }
      });
    });
  });
});
