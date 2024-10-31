---
layout: page-no-title
title: Home
id: home
permalink: /
---

<h1>Projects</h1>
<!-- <p>A collection of design, research, and work projects.</p> -->
<div class="bb">
  <flex class="align-baseline">
    <div style="min-width: 7em"><p>2024</p></div>
    <div>
      [[Making accessibility conformance easier]]
      <p style="margin-top: 0.5rem; font-size: 0.875em" class="muted">An internal tool to help embed accessibility into the product lifecycle at Service NSW.</p>
    </div>
    </flex>
</div>

<div class="bb">
  <flex class="align-baseline">
    <div style="min-width: 7em"><p>2023</p></div>
    <div>
      [[Co-designing Consent]]
      <p style="margin-top: 0.5rem; font-size: 0.875em" class="muted">Consent education is grounded in the human rights of a child, so why is it's delivery fettered with complication?</p>
    </div>
    </flex>
</div>

<div class="bb">
  <flex class="align-baseline">
  <div style="min-width: 7em"><p>2022</p></div>
    <div>
      [[Eli]]
      <p style="margin-top: 0.5rem; font-size: 0.875em" class="muted">An integrated physical and digital solution supporting students suffering from feelings of disconnectedness in remote learning environments.</p>
    </div>
    </flex>
</div>


<h1>Studio</h1>
<!-- <p>An amalgamation of music, photos, visuals and more.</p> -->
<div class="bb">
  <flex class="align-baseline">
    <div style="min-width: 7em"><p>2024</p></div>
    <div>
      [[Cloud Moments]]
      <p style="margin-top: 0.5rem; font-size: 0.875em" class="muted">A collection of MicroKorg pieces, inspired by the clouds that rolled past my bedroom window</p>
    </div>
    </flex>
</div>
<div class="bb">
  <flex class="align-baseline">
    <div style="min-width: 7em"><p>2024</p></div>
    <div>
      [[Parao]]
      <p style="margin-top: 0.5rem; font-size: 0.875em" class="muted">A one hour ambient live performance for a night curated by Moral Laxa</p>
    </div>
    </flex>
</div>


<h1>Latest notes</h1>
<ul style="list-style-type: none; padding-left: 0em;">
  {% assign recent_notes = site.notes | sort: "last_modified_at_timestamp" | reverse %}
  {% for note in recent_notes limit: 5 %}
    <li>
      <span style="display: inline-block; min-width: 7em;">{{ note.last_modified_at | date: "%Y · %m" }} — </span><a class="internal-link" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
    </li>
  {% endfor %}
</ul>
