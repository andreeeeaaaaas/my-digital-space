---
layout: page-no-title
title: Home
id: home
permalink: /
---
<div class="pt">
  <flex class="" style="flex-direction: row; gap: 2rem">
    <!-- <div class="" style="">
      <a class ="element-link" href="/about" style="border-radius: 999px; height: auto; margin: 0;">
        <img class ="rotate-once" src="assets/headshot-greybackground.png" style="border-radius: 999px; max-height: clamp(48px, 6rem, 9rem); margin: 0;">
      </a>
    </div> -->
    <div class="" style="width: 100%; margin: 0rem">
      <p style="text-align: left"><span style="font-size:2rem; font-weight: 500; line-height: 3rem;"> Hi, I’m Andreas 👋 – I make things for people to use, hear, and see</span>
      </p>
    </div>
  </flex>
</div>
  
<h1 class=""><a href="/projects" class="nav-link hover text">Projects Potato</a></h1>

{% assign current_project = site.pages | where: "date", "Now" %}
{% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
{% assign all_projects = current_project | concat: older_projects %}
{% assign project_pages = all_projects | where_exp: "page", "page.path contains 'projects/'" %}

{% assign years = project_pages | map: "date" | uniq  %}

{% for year in years %}
  <div class="projects-container pb bb">
    <div class="sticky-year">
      <p class="muted" style="margin-top: 0rem;">{{ year }}</p>
    </div>
    <div class="projects-list">
      {% assign projects_in_year = project_pages | where: "date", year %}
      {% for page in projects_in_year %}
        <div class="">
          <a href="{{ site.baseurl }}{{ page.url }}" class="card no-arrow-link" style="text-decoration: none; color: inherit;">
            {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %}
            {% if img_tag %}
              <div class="image-container">
                <img style="margin-block-end: 1em" {{ img_tag | split:'>' | first }}>
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
{% endfor %}

<h1 class="pt"><a href="/studio" class="nav-link hover text">Studio</a></h1>
<div>
  {% assign latest_studio_projects = all_projects | where_exp: "page", "page.path contains 'studio/'" %}

  {% for page in latest_studio_projects limit:4 %}
    <div class=" pb">
      <flex class="align-baseline stack-mobile">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="">
          <h2 style ="margin-bottom: 0"><a class="nav-link hover inline" href="{{ site.baseurl }}{{ page.url }}" style="font-size: 1rem">{{ page.title }}</a></h2>
          <p style="margin-top: 0rem" class="subtext">
            {{ page.content | callout_excerpt | default: "No summary available." }}
          </p>
          {% assign img_tag = page.content | split:'<img ' | slice: 1 | first %}
            {% if img_tag %}
              <a href="{{ site.baseurl }}{{ page.url }}" class="element-link hover"><img style="margin-block-end: 1em" {{ img_tag | split:'>' | first }}></a>
            {% endif %}
        </div>
      </flex>
    </div>
  {% endfor %}
</div>


<h1 class="pt"><a href="/notes" class="nav-link hover text">Latest notes</a></h1>
<div class="pb">
  <ul style="list-style-type: none; padding-left: 0em; margin-bottom: 1.5em">
    {% assign recent_notes = site.notes | sort: "published" | reverse %}
    {% for note in recent_notes limit: 5 %}
      <li>
        <span style="display: inline-block" class ="label muted">{{ note.published | date: " %Y · %b" }}</span><a class="nav-link hover" style="font-size: 1rem" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
      </li>
    {% endfor %}
  </ul>
</div>

