---
layout: project
title: Stems
permalink: /stems
date: 2026-11-25
image: /assets/Card-stems.jpg
tags:
  - design
  - music
description: A stem splitter app for musicians, producers, and DJs.
---

<figure>
	<video class="contain" src="assets/projects/stems-split.mp4" poster="assets/projects/stems-split-poster.webp" width="1600" height="1040" autoplay muted loop playsinline preload="metadata" aria-label="Stems splitting a track: dropping in a song, then watching the stems grow"></video>
</figure>
## A native macOS stem splitter for musicians, producers, and DJs.

I always wondered how producers found high-quality samples from other songs, with clean acapellas, drums, or instrumentals. The answer is typically uploading a song to a web service, with accounts, paywalls and queues, or hours and hours of creative EQing.

After a bit of research into what was possible, I made Stems – a small, fast, dedicated Mac app with nothing else to install. Enjoy and let your 90s R&B remix dreams come true.


## Download

Download the app from [GitHub](https://github.com/andreeeeaaaaas/stems-releases/releases).
## Design

The app is inspired by [terminal user interfaces](https://en.wikipedia.org/wiki/Text-based_user_interface) and the low pixel count screens that were common in the earliest form of computing. Typically these older devices did one thing, and did it well. 

The Stems experience is similarly made for speed over complex tweaking, so lots of design effort went into the loading/wait experience; an oft forgotten element in an interface. 

<figure class="">
	<canvas class="stems-plant" width="128" height="96" role="img" aria-label="A pixel plant growing upward and branching, with a coloured flower blooming at the tip of each branch. A new plant grows each time"></canvas>
	<noscript><img src="assets/projects/stems-2-poster.webp" alt="A pixel plant with a coloured flower at the tip of each branch" width="1080" height="1080"></noscript>
	<figcaption>The loading animation</figcaption>
</figure>

Every strand grows with a little bit of Perlin noise affecting height, sway and direction. This makes every stem extraction and grow pattern unique to that individual run.

## Audio

Stems is the first app I've made audio for. I wanted the app to have a calming little reminder of the thougth and care that went into it. It plays only on a fresh download, or an updated build.

Sounds were made using a mix of Kontakt instruments, [[Overly complicated systems|my modular synthesisers]], and VSTs.

<figure>
	<video class="contain" src="assets/projects/stems-4.mp4" poster="assets/projects/stems-4-poster.webp" width="1600" height="1040" autoplay muted loop playsinline preload="metadata" data-audio aria-label="Opening Stems from the Dock: the app zooms in on a splash screen with a pixel flower stem, then shows the drop zone for choosing a track"></video>
	<figcaption>The Stems welcome audio</figcaption>
</figure>

## Usage

**Stems needs a Mac with Apple silicon and macOS 26.2 or later.**

1. Drop in a track or audio snippet (MP3, WAV, M4A, FLAC or AIFF)
2. Pick your settings (you can use your keyboard to navigate)
3. Wait and watch the stems grow
4. Preview the stems, and show in Finder

### Stems
Sets how many stems will be extracted from the audio.
- **2 stems**: vocal + instrumental
- **4 stems**: vocal, bass, drums, other
- **6 stems**: vocal, bass, guitar, piano, drums, other

### Processing
Chooses which model runs the process
- **Fast**: runs a smaller, faster job
- **HQ**: runs at the highest quality with minimal artefacts

<figure class="no-zoom">
	<div class="icon-frame"><img src="assets/projects/stems-1.webp" alt="The Stems app icon" loading="lazy"></div>
	<figcaption>The Stems icon</figcaption>
</figure>

<script src="/assets/js/stems-plant.js" defer></script>
