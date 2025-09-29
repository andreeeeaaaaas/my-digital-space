---
layout: page-no-title
title: Studio
id: studio
permalink: /studio
---
<style>
  /* Only for studio.md */
  .iframe-container iframe {
    background: #fff;
  }
</style>
<div class="callout">A showcase of the things I create or work on in my 'me-time'</div>

<div>
  {% assign current_project = site.pages | where: "date", "Now" %}
  {% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
  {% assign sorted_projects = current_project | concat: older_projects %}
  
  {% assign latest_projects = sorted_projects | where_exp: "page", "page.path contains 'projects/'" %}
  {% assign latest_studio_projects = sorted_projects | where_exp: "page", "page.path contains 'studio/'" %}

  <div class="projects-list">
  {% for page in latest_studio_projects %}
    <div>
      <a href="{{ site.baseurl }}{{ page.url }}" class="card no-arrow-link" style="text-decoration: none; color: inherit;">
        {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %}
        {% if img_tag %}
          <div class="">
            <img style="" {{ img_tag | split:'>' | first }}>
          </div>
        {% endif %}
        {% assign iframe_tag = page.content | split:'<iframe ' | slice: 1 | first %}
        {% if iframe_tag %}
          <div class="iframe-container" style="width: 100%;">
            <iframe style="width: 100%; display: block; min-height: 100px; border-radius: 0.25rem;" {{ iframe_tag | split:'>' | first }}></iframe>
          </div>
        {% endif %}
        <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; align-self: stretch;">
          <h2 style="margin: 0">
            <span class="nav-link hover inline" style="font-size: 1rem">{{ page.title }}</span>
          </h2>
          <p style="margin: 0rem;" class="subtext">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
        </div>
      </a>
    </div>
  {% endfor %}
  </div>
</div>
