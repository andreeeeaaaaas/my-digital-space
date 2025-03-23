---
layout: page-no-title
title: Projects
id: home
permalink: /projects
---
> A collection of outputs I've worked on in a professional or research capacity– spaning across product and service design, research, and more
<div class="">
  {% assign current_project = site.pages | where: "date", "Now" %}
  {% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
  {% assign sorted_projects = current_project | concat: older_projects %}
  
  {% assign latest_projects = sorted_projects | where_exp: "page", "page.path contains 'projects/'" %}

  {% for page in latest_projects %}
    <div class="bb">
      <flex class="align-baseline stack-mobile">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="">
          <h2 style ="margin-top: 1rem"><a class="internal-link" href="{{ site.baseurl }}{{ page.url }}" style="font-size: 1rem">{{ page.title }}</a></h2>
          <p style="margin-top: 0rem; color: #606060">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
        </div>
      </flex>
    </div>
  {% endfor %}
</div>


