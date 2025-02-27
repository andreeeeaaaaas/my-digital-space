---
layout: page-no-title
title: Home
id: home
permalink: /
---
<h1>Projects</h1>
<div>
{% assign current_project = site.pages | where: "year", "Now" %}
{% assign older_projects = site.pages | where_exp: "project", "project.year != 'Now'" | sort: "year" | reverse %}

{% assign sorted_projects = recent_projects | concat: older_projects %}

{% for page in sorted_projects %}
{% if page.path contains 'projects/' %}	
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
{% endif %}
{% endfor %}
</div>

<h1>Studio</h1>
<div>

{% for page in sorted_projects %}
{% if page.path contains 'studio/' %}	
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
{% endif %}
{% endfor %}
</div>


<h1>Latest notes</h1>
<ul style="list-style-type: none; padding-left: 0em;">
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      <span style="display: inline-block" class ="label muted">{{ note.last_modified_at | date: "%b · %Y " }}</span><a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>
