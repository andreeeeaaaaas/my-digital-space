---
layout: index
title: Home
id: home
permalink: /
sound: true
---

<!-- Header -->
<section class="header">
  <div class="intro-text">
    <p>I'm Andreas – a
      <span class="design" data-filter="design">designer</span>,
      <span class="music" data-filter="music">musician</span>, 
      <span class="visual" data-filter="visual">creative</span> (and sometimes <span class="writing" data-filter="writing">writer</span>)<br><br>
      <span id="variable">I help organisations bring value to processes, products, and people through design.</span>
    </p>
  </div>
</section>
<!-- Toolbar -->
<div class="toolbar">
  <div class="tags">
    <button type="button" class="tag active" data-filter="all">All</button>
    <span class="tag-sep" aria-hidden="true">•</span>
    <button type="button" class="tag inactive" data-filter="design">Design</button>
    <span class="tag-sep" aria-hidden="true">•</span>
    <button type="button" class="tag inactive" data-filter="music">Music</button>
    <span class="tag-sep" aria-hidden="true">•</span>
    <button type="button" class="tag inactive" data-filter="visual">Visual</button>
    <span class="tag-sep" aria-hidden="true">•</span>
    <button type="button" class="tag inactive" data-filter="writing">Writing</button>
  </div>
</div>

{% assign projects = site.pages | where_exp: "page", "page.path contains 'projects/'" %}
{% assign studio = site.pages | where_exp: "page", "page.path contains 'studio/'" %}
{% assign notes = site.notes | where_exp: "page", "page.path contains 'notes/'" %}
{% assign all_pages = projects | concat: studio | concat: notes | sort: "date" | reverse %}

<!-- Project Grid -->
<div class="project-grid list-view">
  {% for page in all_pages %}
  <div class="project" data-tags="{{ page.tags | join: ', ' }}">
      <a href="{{ site.baseurl }}{{ page.url }}" class="internal-link no-underline">
        <div class="project-title-row">
          <div class="project-text">
            <div class="project-title-with-tags">
              <h2 class="project-title">{{ page.title }}</h2>
            </div>
            <p class="project-description">{{ page.description | strip_html | default: "No summary available." }}</p>
          </div>
          <div class="project-tags-list" aria-label="Tags: {{ page.tags | join: ', ' }}">
            {% for tag in page.tags %}
              <span class="tag-dot {{ tag | downcase }}" aria-hidden="true"></span>
            {% endfor %}
          </div>
          {% if page.date %}<span class="project-year">{{ page.date | date: "%b %Y" }}</span>{% endif %}
        </div>
        
      </a>
  </div>
  {% endfor %}
</div>
<hr>
<br>
<br>
I've got lots more ideas and projects I'm working on. <br><br>
If you would like to hear about them, or work on one together, please <a href="/contact" class="internal-link emoji-hover" data-emoji="📞">reach out</a>.
