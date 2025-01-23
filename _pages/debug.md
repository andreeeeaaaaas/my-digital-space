---
layout: default
title: Debug Page
permalink: /debug/
---

<h1>Debug Backlinks</h1>
<h2>Pages</h2>
<pre>
{% for page in site.pages %}
Page: {{ page.title }}
Backlinks: {{ page.backlinks | jsonify }}
{% endfor %}
</pre>

<h2>Notes</h2>
{% for note in site.notes %}
<pre>Note: <a href="{{ site.baseurl }}{{ note.url }}">{{ note.title }}</a></pre>

<pre>Backlinks:</pre>
{% if note.backlinks.size > 0 %}
{% for backlink in note.backlinks %}
<pre>
<a href="{{ site.baseurl }}{{ backlink.url }}">{{ backlink.title }}</a> - {{ backlink.content | strip_html| truncatewords: 20 }}
</pre>
{% endfor %}
  {% else %}
    <p>No backlinks available.</p>
  {% endif %}
{% endfor %}
