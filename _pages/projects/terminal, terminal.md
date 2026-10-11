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

**Terminal, Terminal!** is a tiny, native swift terminal for your Terminal.<br>
(Yes, I did have fun with this one).

## Problem
While working on more projects, I have needed a better way to see the dev servers I have inadvertently forgotten about. These suck up battery and CPU, and leave me feeling like I'm working on a messy, cluttered desk.

## Solution
Any traveller knows how a departure board draws the eye like no other object in an airport. 

Terminal, Terminal!'s departure board floats over your desktop and lists every dev server you have running. Each one is a flight: the port is the gate, the tool and project are the flight, with PID, status and uptime alongside.

Servers board when they start, go idle when they stop working, and depart when they quit. Hover a row to stop any server, and if it just won't leave the runway, it will asks you before force quitting and departing (your CPU).

To make it a little bit more [[Overly complicated systems|modular]], there are seven board styles to choose from. You can also choose an accent colour and whether to show seconds.

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
The first time I ran it, it found four Astro servers I'd forgotten about.<br>
One had been running for 90 hours.

<figure>
	<div class="icon-frame"><img src="assets/projects/terminal-terminal-icon.webp" alt="The Terminal, Terminal! app icon: a departing plane above a cursor" loading="lazy"></div>
	<figcaption>The Terminal,Terminal! icon</figcaption>
</figure>
