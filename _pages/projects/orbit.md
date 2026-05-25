---
layout: project
title: Orbit
permalink: /orbit
date: 2026-04-20
tags:
  - design
description: A retro-futuristic design tool for Figma
---

<figure class="">
	<img class="contain" src="assets/projects/orbit-ui.png">
	<figcaption>The Orbit user interface</figcaption>
</figure>

Inspired by the space age graphics and interfaces of old, Orbit is a Figma plugin that solves a problem that Figma currently does not. 

It works across Figma Design and Figma Slides.

## Problem

Photoshop and other design tools have similar methods of duplication, often called 'repeat transforms'. However they are buried away behind menus and sub-menus. 

There are multiple Figma plugins out there to create Venn diagrams, rotate text around an arc, and create circular text. However, they all missed what I felt was the core problem itself (something that Figma doesn't enable): programatically distributing objects non-linearly, around an arc.

I wanted to make something fast, free, and fun in a way that promotes experimentation. Beyond that, I really wanted to see if I could **build a Figma plugin from scratch in less than an hour**.

## Solution

I built this plugin in under an hour.

It does exactly what it says on the tin: distributing copies of any object around a configurable arc. Users can control the count, distance from centre, origin angle, sweep, and rotation mode — which alone produces wildly different results depending on the selection.

The live preview was the most considered part of the UI: distribution and rotation are hard to visualise mentally, so showing the output in real time — framed in the space-age aesthetic — keeps experimentation fast and low-stakes.

If you would like, you can [check out Orbit in Figma](https://www.figma.com/community/plugin/1616762647761910788/orbit).

## Examples
<img class="bt bl br bb" src="assets/projects/orbit-examples7.webp">
<img class="bt bl br bb" src="assets/projects/orbit-examples3.webp">
<img class="bt bl br bb" src="assets/projects/orbit-examples4.webp">
<img class="bt bl br bb" src="assets/projects/orbit-examples5.webp">
<img class="bt bl br bb" src="assets/projects/orbit-examples6.webp">
<img class="bt bl br bb" src="assets/projects/orbit-examples2.webp">