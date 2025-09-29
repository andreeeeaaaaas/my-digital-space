document.addEventListener("DOMContentLoaded", () => {
  // Web Audio setup
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.4; // volume
  masterGain.connect(audioCtx.destination);

  // // Unlock function
  const unlock = () => {
    if (audioCtx.state !== "running") audioCtx.resume();
  };

  // Sound picker
  const overlay = document.getElementById("sound-gate");
  const yesBtn = document.getElementById("sound-yes");
  const noBtn = document.getElementById("sound-no");
  // const toggleBtn = document.getElementById("sound-toggle");
  // Creating userChoice variable
  // let userChoice;

   // === State ===
  // let isSoundOn = false; // Current session setting

  // === On first load ===
  // const savedPref = sessionStorage.getItem("soundEnabled");

  // if (savedPref === null) {
  //   // First visit → show modal
  //   overlay.classList.remove("hidden");
  // } else {
  //   // Already chosen before
  //   overlay.classList.add("hidden");
  //   isSoundOn = savedPref === "true";
  //   updateToggleUI();
  // }

  // // Check if user already made a choice
  // console.log("Is sound enabled? " + sessionStorage.getItem("soundEnabled"));
  // if (sessionStorage.getItem("soundEnabled") == "true") {
  //   overlay.classList.add("hidden");
  //   return;
  // }

  // function updateToggleUI() {
  //   toggleBtn.textContent = isSoundOn ? "Sound: On" : "Sound: Off";
  // }

  yesBtn.addEventListener("click", () => {
    sessionStorage.setItem("soundEnabled", "true");
    unlock();
    console.log("Is sound enabled? " + sessionStorage.getItem("soundEnabled"));
    overlay.classList.add("hidden");
    // userChoice = sessionStorage.getItem("soundEnabled");
    // updateToggleUI();
  });

  noBtn.addEventListener("click", () => {
    sessionStorage.setItem("soundEnabled", "false");
    unlock();
    console.log("Is sound enabled? " + sessionStorage.getItem("soundEnabled"));
    overlay.classList.add("hidden");
    // userChoice = sessionStorage.getItem("soundEnabled");
    // console.log(userChoice);
    // updateToggleUI();
  });

  // === Toggle button (does NOT save to localStorage) ===
  // toggleBtn.addEventListener("click", () => {
  //   isSoundOn = !isSoundOn;
  //   updateToggleUI();
  // });

  const tagSoundFiles = [
    "/assets/sounds/1.mp3",
    "/assets/sounds/2.mp3",
    "/assets/sounds/3.mp3",
    "/assets/sounds/4.mp3",
    "/assets/sounds/5.mp3",
  ];

  const projectSoundFiles = [
    "/assets/sounds/hover 1.mp3",
    "/assets/sounds/hover 2.mp3",
    "/assets/sounds/hover 3.mp3",
    "/assets/sounds/hover 4.mp3",
    "/assets/sounds/hover 5.mp3",
  ];

  const allSoundFiles = [...tagSoundFiles, ...projectSoundFiles];

  // Preload + decode once
  const bufferCache = new Map();
  Promise.all(
    allSoundFiles.map(async (src) => {
      const resp = await fetch(src, { cache: "force-cache" });
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      bufferCache.set(src, audioBuf);
    })
  ).catch(console.error);

  // Shuffle queue for variety
  let tagQueue = [];
  let projectQueue = [];
  function getNextTagSound() {
    if (tagQueue.length === 0)
      tagQueue = tagSoundFiles.slice().sort(() => Math.random() - 0.5);
    return tagQueue.pop();
  }
  function getNextProjectSound() {
    if (projectQueue.length === 0)
      projectQueue = projectSoundFiles.slice().sort(() => Math.random() - 0.5);
    return projectQueue.pop();
  }

  // Play helper: creates a source per play so overlaps work
  function playBuffer(src) {
    if (audioCtx.state !== "running") return; // Prevent play if not unlocked
    const buf = bufferCache.get(src);
    if (!buf) return; // not ready yet
    const srcNode = audioCtx.createBufferSource();
    srcNode.buffer = buf;
    srcNode.connect(masterGain);
    srcNode.start(0);
    // Auto GC when finished
    srcNode.addEventListener("ended", () => srcNode.disconnect());
  }

  // Hook up hover
  document.querySelectorAll(".tag").forEach((tag) => {
    // if (userChoice === "false") return;
    tag.addEventListener("mouseenter", () => {
      if (tag.classList.contains("active")) return;
      if (sessionStorage.getItem("soundEnabled") === "false") return;
      const sound = getNextTagSound();
      playBuffer(sound).catch(console.error);
    });
  });
  document.querySelectorAll(".project-image").forEach((img) => {
    // if (userChoice === "false") return;
    img.addEventListener("mouseenter", () => {
      const sound = getNextProjectSound();
      if (sessionStorage.getItem("soundEnabled") === "false") return;
      playBuffer(sound).catch(console.error);
    });
  });
});
