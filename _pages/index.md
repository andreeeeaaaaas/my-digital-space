---
layout: index
title: Home
id: home
permalink: /
sound: true
---

<!-- <div id="sound-gate" class="overlay">
  <div class="overlay-content">
    <p style="margin-top:0">Would you like to enable sound?</p>
    <div style="display: flex; flex-direction: row;gap: 16px; padding-top: 16p;">
      <button  id="sound-yes">Yes</button>
      <p>/</p>
      <button href="#" id="sound-no">No</button>
    </div>
  </div>
</div> -->
<!-- Header -->
<section class="header">
  <div class="intro-text">
    <p>I'm Andreas –
      <span class="design" data-filter="design">designer</span>,
      <span class="music" data-filter="music">musician</span>, and
      <span class="visual" data-filter="visual">creative</span> (and sometimes <span class="writing" data-filter="writing">writer</span>)<br><br>
      <span id="variable"> I help organisations bring value to processes, products, and people through design.</span>
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
        <div class="role">Design Tutor</div>
      </div>
    </div>
  </div> -->
</section>
<!-- Toolbar -->
<div>
  <div class="toolbar mobile-controls">
    <div class="" style="display:flex; gap: 6px">
      <button type="button" class="tag inactive filter" id="filter-toggle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill=""><path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6 5.71429L3.59961 5.71387V12H2.40039V5.71387L0 5.71429V0H6V5.71429ZM1.2002 4.57129H4.7998V1.14258H1.2002V4.57129Z" fill="#"/><path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12 6.28571L9.59961 6.28613V0H8.40039V6.28613L6 6.28571V12H12V6.28571ZM7.2002 7.42871H10.7998V10.8574H7.2002V7.42871Z" fill="#"/></svg>
        Filters
      </button>
      <button type="button" class="tag inactive" data-filter="design" title="Design" style="display:none" >
          <span class="tag-square"></span>
        </button>
        <!-- <button type="button" class="tag" data-filter="research">Research</button> -->
        <button type="button" class="tag inactive" data-filter="music" title="Music" style="display:none;" >
          <span class="tag-square"></span>
        </button>
        <button type="button" class="tag inactive" data-filter="visual" title="Visual" style="display:none;" ><span class="tag-square"></span></button>
        <button type="button" class="tag inactive" data-filter="writing" title="Writing" style="display:none;" >
          <span class="tag-square"></span>
        </button>
    </div>
    <button type="button" class="tag inactive view">
      <div class="" style="display: flex; width: 14px; height: 12px; flex-direction: column; align-items: flex-start; gap: 10px; border-style: solid; border-width: 2px; border-color: #100F0F);"></div>
      Grid
    </button>
  </div>
  <div class ="toolbar">
    <div class="tags">
      <button type="button" class="tag inactive" data-filter="design">
        <span class="tag-square"></span>Design
      </button>
      <!-- <button type="button" class="tag" data-filter="research">Research</button> -->
      <button type="button" class="tag inactive" data-filter="music">
        <span class="tag-square"></span>Music
      </button>
      <button type="button" class="tag inactive" data-filter="visual"><span class="tag-square"></span>Visual</button>
      <button type="button" class="tag inactive" data-filter="writing">
        <span class="tag-square"></span>Writing
      </button>
    </div>
    <div class="view-controls">
      <span class="view-label">View</span>
      <button type="button" class="tag view-control active" id="grid-button">
        <div class="grid-icon"></div>
        Grid
      </button>
      <button type="button" class="tag view-control" id="list-button">
        <div class="list-icon" style="">
          <div class="list-bar" style=""></div>
          <div class="list-bar" style=""></div>
        </div>
        List
      </button>
    </div>
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
        {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %} 
        {% if img_tag %}
        <div class="project-image">
          <img style="margin-block-end: 0em" {{ img_tag | split:'>' | first }}>
          <div class="project-tags" aria-label="Tags: {{ page.tags | join: ', ' }}">
            {% for tag in page.tags %}
              <span class="tag-dot {{ tag | downcase }}" aria-hidden="true"></span>
            {% endfor %}
          </div>
        </div>
        {% endif %}
        <div style="display: flex; align-items: center; gap: 12px; align-self: stretch;">
          <h2 class="project-title">{{ page.title }}</h2>
          <div class="project-tags-list" aria-label="Tags: {{ page.tags | join: ', ' }}">
            {% for tag in page.tags %}
              <span class="tag-dot {{ tag | downcase }}" aria-hidden="true"></span>
            {% endfor %}
          </div>
        </div>
        <p class="project-description">
          {{ page.description | strip_html | default: "No summary available." }}</p>
        
      </a>
  </div>
  {% endfor %}
</div>
<hr>
<br>
<br>
I've got lots more ideas and projects I'm working on. <br><br>
If you would like to work on one together, please [[Contact|reach out]].
