---
layout: page-no-title
title: Notes
id: notes
permalink: /notes
---
<div class="callout">Writings on all sorts of topics, sorted by published year– note that many of these are [[What's a digital space?|evergreen notes]] and are updated over time</div>
<div class="pt">
  <ul style="list-style-type: none; padding-left: 0em; margin-bottom: 1.5em">
    {% assign recent_notes = site.notes | sort: "published" | reverse %}
    {% for note in recent_notes limit: 5 %}
      <li>
        <span style="display: inline-block" class ="label muted">{{ note.published | date: " %Y · %m" }}</span><a class="nav-link hover" style="font-size: 1rem" href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a>
      </li>
    {% endfor %}
  </ul>
</div>


