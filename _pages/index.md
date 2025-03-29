---
layout: page-no-title
title: Home
id: home
permalink: /
---
<div class="pt">
  <flex class="align-center" style="flex-direction: row">
    <div class="label" style="">
      <a class ="element-link" href="/about" style="border-radius: 999px; height: auto; margin: 0;">
        <img class ="rotate-once" src="assets/headshot-greybackground.png" style="border-radius: 999px; max-height: clamp(64px, 12vw, 6rem); margin: 0;">
      </a>
    </div>
    <div class="callout" style="width: 100%">
      <p>
       Hi, I’m Andreas 👋 – I make things for people to use, hear, and see
      </p>
    </div>
  </flex>
</div>

<h1 class=""><a href="/projects" class="nav-link hover">Projects</a></h1>
<div>
  {% assign current_project = site.pages | where: "date", "Now" %}
  {% assign older_projects = site.pages | where_exp: "project", "project.date != 'Now'" | sort: "date" | reverse %}
  {% assign sorted_projects = current_project | concat: older_projects %}
  
  {% assign latest_projects = sorted_projects | where_exp: "page", "page.path contains 'projects/'" %}

  {% for page in latest_projects limit:5 %}
    <div class="bb">
      <flex class="align-baseline stack-mobile">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="">
          <h2 style =""><a class="nav-link hover text" href="{{ site.baseurl }}{{ page.url }}" style="font-size: 1rem">{{ page.title }}</a></h2>
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

<h1 class="pt"><a href="/studio" class="nav-link hover text">Studio</a></h1>
<div>
  {% assign latest_studio_projects = sorted_projects | where_exp: "page", "page.path contains 'studio/'" %}

  {% for page in latest_studio_projects limit:4 %}
    <div class="bb">
      <flex class="align-baseline stack-mobile">
        <div class="label muted">
          <p>{{ page.date }}</p>
        </div>
        <div class="">
          <h2 style =""><a class="nav-link hover" href="{{ site.baseurl }}{{ page.url }}" style="font-size: 1rem">{{ page.title }}</a></h2>
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


<h1 class="pt"><a href="/notes" class="nav-link hover text">Latest notes</a></h1>
<div class="bb">
  <ul style="list-style-type: none; padding-left: 0em; margin-bottom: 1.5em">
    {% assign recent_notes = site.notes | sort: "published" | reverse %}
    {% for note in recent_notes limit: 5 %}
      <li>
        <span style="display: inline-block" class ="label muted">{{ note.published | date: " %Y · %b" }}</span><a class="nav-link hover" style="font-size: 1rem" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
      </li>
    {% endfor %}
  </ul>
</div>

