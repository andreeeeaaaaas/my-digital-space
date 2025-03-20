---
layout: page-no-title
title: Studio
id: studio
permalink: /studio
---
> A showcase of the things I create or work on in my 'me-time'

<div>
  {% assign current_project = site.pages | where: "date", "Now" %}
  {% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
  {% assign sorted_projects = current_project | concat: older_projects %}
  
  {% assign latest_projects = sorted_projects | where_exp: "page", "page.path contains 'projects/'" %}
  {% assign latest_studio_projects = sorted_projects | where_exp: "page", "page.path contains 'studio/'" %}

  {% for page in latest_studio_projects %}
    <div class="">
      <flex class="align-baseline stack-mobile">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="bb">
          <h2 style =""><a class="internal-link" href="{{ site.baseurl }}{{ page.url }}" style="font-size: 1rem">{{ page.title }}</a></h2>
          <p style="margin-top: 0rem; color: #606060">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
          {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %}
            {% if img_tag %}
              <img style="margin-block-end: 1em" {{ img_tag | split:'>' | first }}>
            {% endif %}
        </div>
      </flex>
    </div>
  {% endfor %}
</div>


