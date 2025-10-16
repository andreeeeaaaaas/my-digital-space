---
layout: page-no-title
title: Home
id: home
permalink: /
---

<div id="sound-gate" class="overlay">
  <div class="overlay-content">
    <p style="margin-top:0">Would you like to enable sound?</p>
    <div style="display: flex; flex-direction: row;gap: 16px; padding-top: 16p;">
      <button  id="sound-yes">Yes</button>
      <p>/</p>
      <button href="#" id="sound-no">No</button>
    </div>
  </div>
</div>

<!-- Header -->
<section class="header">
  <div class="intro-text">
    <p>I'm Andreas – a
      <span class="design" data-filter="design">designer</span>,
      <span class="music" data-filter="music">musician</span>, and
      <span class="writing" data-filter="writing">creative</span>.
    </p>
    <br />
    <p>
      I help organisations see the value design can bring to processes, products, and people. I thrive tackling challenges when user empathy combines with smart business strategy to drive decisions.
    </p>
  </div>

  <!-- <div class="experiences">
    <div class="experience-section">
      <div class="section-label">NOW</div>
      <div class="experience-item">
        <div class="company">
          <a class ="external"
            href="https://www.service.nsw.gov.au/about-us/digital-capabilities"
            >Service NSW</a
          >
        </div>
        <div class="role">Product Design</div>
      </div>
    </div>
    <div class="experience-section">
      <div class="section-label">PREVIOUSLY</div>
      <div class="experience-item">
        <div class="company">
          <a class ="external" href="https://www.icare.nsw.gov.au/about-us">icare</a>
        </div>
        <div class="role">Intelligent Automation</div>
      </div>
      <div class="experience-item">
        <div class="company">
          <a class ="external"
            href="https://www.sydney.edu.au/courses/courses/uc/bachelor-of-design-interaction-design.html"
            >University of Sydney</a
          >
        </div>
        <div class="role">Academic Tutor</div>
      </div>
    </div>
  </div> -->
</section>

<!-- Toolbar -->
<div class="toolbar">
  <div class="tags">
    <button type="button" class="tag active">All</button><span>,</span>
    <button type="button" class="tag inactive" data-filter="design">
      Design</button
    ><span>,</span>
    <!-- <button type="button" class="tag" data-filter="research">Research</button> -->
    <button type="button" class="tag inactive" data-filter="music">
      Music</button>
      <span>,</span>
    <!-- <button type="button" class="tag inactive" data-filter="visual">
      Visual</button>
      <span>,</span> -->
    <button type="button" class="tag inactive" data-filter="writing">
      Writing
    </button>
  </div>

  <div class="view-controls">
    <span class="view-label">View</span>
    <button type="button" class="grid-icon active" title="Grid view">
      <div class="grid-square"></div>
      <div class="grid-square"></div>
      <div class="grid-square"></div>
      <div class="grid-square"></div>
    </button>
    <button type="button" class="list-icon" title="List view">
      <div class="list-bar"></div>
      <div class="list-bar"></div>
    </button>
  </div>
</div>

{% assign projects = site.pages | where_exp: "page", "page.path contains 'projects/'" %}
{% assign studio = site.pages | where_exp: "page", "page.path contains 'studio/'" %}
{% assign notes = site.notes | where_exp: "page", "page.path contains 'notes/'" %}
{% assign all_pages = projects | concat: studio | sort: "date" | reverse | concat: notes %}

<!-- Project Grid -->
<div class="project-grid">
  {% for page in all_pages %}
  <div class="project" data-tags="{{ page.tags | join: ', ' }}">
    <a href="{{ site.baseurl }}{{ page.url }}" class="internal-link no-underline">
      {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %} {%
      if img_tag %}
      <div class="project-image">
        <img style="margin-block-end: 0em" {{ img_tag | split:'>' | first }}>
      </div>
      {% endif %}
        <h2 class="project-title">{{ page.title }}</h2>
      <p class="project-description">
        {{ page.content | callout_excerpt | truncate: 60, "..." | default: "No
        summary available." }}
      </p>
    </a>
  </div>
  {% endfor %}
</div>
<hr>
<br>
<br>
I've got lots more ideas and projects I'm working on. <br>
If you would like to work on one together, please [[Contact|reach out]].
