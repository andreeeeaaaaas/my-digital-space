---
layout: page-no-title
title: Home
id: home
permalink: /
---

<h1>Projects</h1>

<div>
  {% assign current_project = site.pages | where: "date", "Now" %}
  {% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
  {% assign sorted_projects = current_project | concat: older_projects %}
  
  {% assign latest_projects = sorted_projects | where_exp: "page", "page.path contains 'projects/'" %}

  {% for page in latest_projects limit:5 %}
    <div>
      <flex class="align-baseline">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="bb">
          <a class="internal-link" href="{{ site.baseurl }}{{ page.url }}">{{ page.title }}</a>
          <p style="margin-top: 0; font-size: 0.875em" class="subtext">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
        </div>
      </flex>
    </div>
  {% endfor %}
</div>

<h1>Studio</h1>
---
<div>
  {% assign latest_studio_projects = sorted_projects | where_exp: "page", "page.path contains 'studio/'" %}

  {% for page in latest_studio_projects limit:4 %}
    <div>
      <flex class="align-baseline">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="bb">
          <a class="internal-link" href="{{ site.baseurl }}{{ page.url }}">{{ page.title }}</a>
          <p style="margin-top: 0; font-size: 0.875em" class="subtext">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
        </div>
      </flex>
    </div>
  {% endfor %}
</div>


<h1>Latest notes</h1>
---
<!-- <ul style="list-style-type: none; padding-left: 0em;">
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      <span style="display: inline-block" class ="label muted">{{ note.last_modified_at | date: "%b · %Y " }}</span><a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul> -->
<ul style="list-style-type: none; padding-left: 0em;">
  {% assign recent_notes = site.notes | sort: "published" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      <span style="display: inline-block" class ="label muted">{{ note.published | date: "%b · %Y " }}</span><a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>

