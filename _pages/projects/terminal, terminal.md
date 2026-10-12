---
layout: project
title: Terminal, Terminal!
permalink: /terminal-terminal
date: 2026-10-10
tags:
  - design
  - creative
description: A terminal for your terminal
---

<figure><iframe class="tt-embed" src="/assets/demos/terminal-terminal/index.html" title="Terminal, Terminal! interactive demo" loading="lazy"></iframe><figcaption>Have a play!</figcaption></figure>

**Terminal, Terminal!** is a tiny, native swift terminal for your Terminal.
(Yes, I did have fun with this one).

## Problem
While working on more projects, I have needed a better way to see the dev servers I have inadvertently forgotten about. These suck up battery and CPU, and leave me feeling like I'm working on a messy, cluttered desk.
## Solution

Terminal, Terminal! is a mini [information display system](https://en.wikipedia.org/wiki/Flight_information_display_system) that floats over your desktop and lists every dev server you have running. You can stop servers straight from the board, rather than diving in and `ctrl - c`-ing your way through Terminal processes.

Opening Terminal, Terminal! happens through the top toolbar. You can open a server in your browser or quit ones you no longer need. Drag it to move it around or hide it, and set it to show automatically whenever a new server starts.

To bring a bit of [[Overly complicated systems|my modular ethos]], there are seven styles to choose from as well as accent colours. You can also choose whether to show seconds or just `hh:mm`.

<div class="carousel" aria-label="Board styles">
<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-charcoal.webp" alt="The board in the Charcoal style" loading="lazy">
	<figcaption>Charcoal</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-frankfurt.webp" alt="The board in the Frankfurt style" loading="lazy">
	<figcaption>Frankfurt</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-compact.webp" alt="The board in the Compact style" loading="lazy">
	<figcaption>Compact</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-ledger.webp" alt="The board in the Ledger style" loading="lazy">
	<figcaption>Ledger</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-led-amber.webp" alt="The board in the LED Amber style" loading="lazy">
	<figcaption>LED Amber</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-led-multicolour.webp" alt="The board in the LED Multicolour style" loading="lazy">
	<figcaption>LED Multicolour</figcaption>
</figure>

<figure class="">
	<img class="contain" src="assets/projects/terminal-terminal-pixel.webp" alt="The board in the Pixel style" loading="lazy">
	<figcaption>Pixel</figcaption>
</figure>
</div>

## Outcome
The first time I ran it, it found four Astro servers I'd forgotten about.
One had been running for 90 hours.

<figure>
	<div class="icon-frame"><img src="assets/projects/terminal-terminal-icon.webp" alt="The Terminal, Terminal! app icon: a departing plane above a cursor" loading="lazy"></div>
	<figcaption>The Terminal,Terminal! icon</figcaption>
</figure>
Download it from [GitHub](https://github.com/andreeeeaaaaas/terminal-terminal/releases).