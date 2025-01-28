---
layout: page-no-title
title: Home
id: home
permalink: /
---

<h1>Projects</h1>
<!-- <div>
{% for page in site.pages %}
  {% if page.path contains 'projects/' %}
  <div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>{{page.last_modified_at | date:"%Y"}}</p></div>
    <div>
      <a class="internal-link">{{ page.title }}</a>
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">{{  page.content | strip_html | truncatewords: 20  }}</p>
    </div>
    </flex>
</div>
  {% endif %}
{% endfor %}
</div> -->
<!-- <p>A collection of design, research, and work projects.</p> -->
<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>Now</p></div>
    <div>
      [[This site!]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">An open-source, extremely lightweight static site, built as an alternative to (expensive) low-code solutions.</p>
    </div>
    </flex>
</div>
<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>2024</p></div>
    <div>
      [[Making accessibility conformance easier]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">An internal tool to help embed accessibility into the product lifecycle at Service NSW.</p>
    </div>
    </flex>
</div>

<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>2023</p></div>
    <div>
      [[Co-designing consent]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">Consent education is grounded in the human rights of a child, so why is it's delivery fettered with complication?</p>
    </div>
    </flex>
</div>

<div class="pt">
  <flex class="align-baseline">
  <div class="label muted"><p>2022</p></div>
    <div>
      [[Eli]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">An integrated physical and digital solution supporting students suffering from feelings of disconnectedness in remote learning environments.</p>
    </div>
    </flex>
</div>


<h1>Studio</h1>
<!-- <p>An amalgamation of music, photos, visuals and more.</p> -->
<!-- <div>
{% for page in site.pages %}
  {% if page.path contains 'studio/' %}
  <div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>{{page.year}}</p></div>
    <div>
      <a class="internal-link">{{ page.title }}</a>
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">{{  page.content | strip_html | truncatewords: 20  }}</p>
    </div>
    </flex>
</div>
  {% endif %}
{% endfor %}
</div>-->
<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>2025</p></div>
    <div>
      [[Patina]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">A one-hour long selection of tracks and accompanying interview, aired live on fbi radio on the 26th of January, 2025</p>
    </div>
    </flex>
</div>
<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>2024</p></div>
    <div>
      [[Cloud Moments]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">A collection of MicroKorg pieces, inspired by the clouds that rolled past my bedroom window</p>
    </div>
    </flex>
</div>
<div class="pt">
  <flex class="align-baseline">
    <div class="label muted"><p>2024</p></div>
    <div>
      [[Parao]]
      <p style="margin-top: 0; font-size: 0.875em" class="subtext">A one hour ambient live performance for a night curated by Moral Laxa</p>
    </div>
    </flex>
</div>


<h1>Latest notes</h1>
<ul style="list-style-type: none; padding-left: 0em;" class="pt">
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      <span style="display: inline-block" class ="label muted">{{ note.last_modified_at | date: "%Y · %m " }}</span><a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>
