document.addEventListener("DOMContentLoaded", () => {
  // Web Audio setup
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.4; // volume
  masterGain.connect(audioCtx.destination);

  // Track active sources for cleanup
  const activeSources = new Set();
  const MAX_CONCURRENT_SOUNDS = 6; // Limit simultaneous sounds

  // Unlock function
  const unlock = () => {
    if (audioCtx.state !== "running") audioCtx.resume().catch(console.error);
    if (audioCtx.state === "suspended") {
      return audioCtx.resume().catch(console.error);
    }

  };


  // Sound picker
  // const overlay = document.getElementById("sound-gate");
  // const yesBtn = document.getElementById("sound-yes");
  // const noBtn = document.getElementById("sound-no");
  const soundToggle = document.getElementById("sound-toggle");

  // Update toggle button UI to match current sound state
  function updateToggleUI() {
    if (isSoundOn) {
      soundToggle.classList.remove("muted");
      soundToggle.setAttribute("aria-label", "Mute sound");
    } else {
      soundToggle.classList.add("muted");
      soundToggle.setAttribute("aria-label", "Unmute sound");
    }
  }
  // === State ===
  let isSoundOn = false; // Current session setting

  // // === On first load ===
  // const savedPref = sessionStorage.getItem("soundEnabled");

  // try {
  //   if (savedPref === null) {
  //     // First visit → show modal
  //     // overlay.classList.remove("hidden");
  //     updateToggleUI();
  //   } else {
  //     // Already chosen before
  //     // overlay.classList.add("hidden");
  //     isSoundOn = savedPref === "true";
  //     updateToggleUI();
  //     unlock();
  //   }
  // } catch (error) {
  //   console.error("Error handling sound preferences:", error);
  // }
  updateToggleUI();

  // // Yes button - enable sound
  // yesBtn.addEventListener("click", () => {
  //   sessionStorage.setItem("soundEnabled", "true");
  //   isSoundOn = true;
  //   unlock();
  //   console.log("Is sound enabled? " + sessionStorage.getItem("soundEnabled"));
  //   overlay.classList.add("hidden");
  //   updateToggleUI();
  // });

  // // No button - disable sound
  // noBtn.addEventListener("click", () => {
  //   sessionStorage.setItem("soundEnabled", "false");
  //   isSoundOn = false;
  //   unlock();
  //   console.log("Is sound enabled? " + sessionStorage.getItem("soundEnabled"));
  //   overlay.classList.add("hidden");
  //   updateToggleUI();
  // });

  // === Toggle button (updates both session storage and UI) ===
  soundToggle.addEventListener("click", () => {
    console.log("Toggle button pressed");
    isSoundOn = !isSoundOn;
    sessionStorage.setItem("soundEnabled", isSoundOn.toString());
    updateToggleUI();
    console.log(isSoundOn ? "Sound unmuted" : "Sound muted");
    unlock();

    // Stop all active sounds when muting
    if (!isSoundOn) {
      activeSources.forEach((source) => {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {
          // Already stopped/disconnected
        }
      });
      activeSources.clear();
    }
  });

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
      try {
        const resp = await fetch(src, { cache: "force-cache" });
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
        bufferCache.set(src, audioBuf);
      } catch (err) {
        console.error(`Failed to load sound: ${src}`, err);
      }
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

  // Play helper with proper resource management
  function playBuffer(src) {
    if (!isSoundOn) return;
    if (audioCtx.state !== "running") return;

    // Limit concurrent sounds
    if (activeSources.size >= MAX_CONCURRENT_SOUNDS) {
      const oldestSource = activeSources.values().next().value;
      try {
        oldestSource.stop();
        oldestSource.disconnect();
      } catch (e) {
        // Already stopped
      }
      activeSources.delete(oldestSource);
    }

    const buf = bufferCache.get(src);
    if (!buf) return;

    try {
      const srcNode = audioCtx.createBufferSource();
      srcNode.buffer = buf;
      srcNode.connect(masterGain);
      activeSources.add(srcNode);

      // Cleanup when finished
      const cleanup = () => {
        activeSources.delete(srcNode);
        try {
          srcNode.disconnect();
        } catch (e) {
          // Already disconnected
        }
      };

      srcNode.onended = cleanup;
      srcNode.start(0);
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  }

  // Play two random project sounds simultaneously
  function playDualSound() {
    // Create a shuffled copy of project sound files
    const shuffledSounds = tagSoundFiles.slice().sort(() => Math.random() - 0.5);
    
    // Play the first two sounds from the shuffled array
    const sound1 = shuffledSounds[0];
    const sound2 = shuffledSounds[1];
    const sound3 = shuffledSounds[2];
    
    // Play both sounds simultaneously
    playBuffer(sound1);
    playBuffer(sound2);
    playBuffer(sound3);
  }

  // Throttle helper to prevent rapid-fire sounds
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();
      const timeSinceLastExec = currentTime - lastExecTime;

      if (timeSinceLastExec >= delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      }
    };
  }

  // Hook up hover with throttling
  document.querySelectorAll(".tag").forEach((tag) => {
    const playTagSound = throttle(() => {
      if (tag.classList.contains("active")) return;
      const sound = getNextTagSound();
      playBuffer(sound);
    }, 100); // Minimum 100ms between sounds per tag

    tag.addEventListener("mouseenter", playTagSound);
  });

  document.querySelectorAll(".project").forEach((project) => {
    const playProjectSound = throttle(() => {
      const sound = getNextProjectSound();
      playBuffer(sound);
    }, 100); // Minimum 100ms between sounds per project

    project.addEventListener("mouseenter", playProjectSound);
  });

  // Hook up emoji hover with dual sound playback
  function initEmojiHoverSounds() {
    document.querySelectorAll(".emoji-hover").forEach((element) => {
      const playDualHoverSound = throttle(() => {
        playDualSound();
      }, 100); // Minimum 100ms between sounds per emoji hover element

      element.addEventListener("mouseenter", playDualHoverSound);
    });
  }

  // Initialize emoji hover sounds immediately and also when DOM is ready
  initEmojiHoverSounds();
  
  // Also initialize when DOM is fully loaded (in case elements are added later)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmojiHoverSounds);
  }
});
