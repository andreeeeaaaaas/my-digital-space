# frozen_string_literal: true

require 'cgi'
require 'json'
require 'time'
require 'nokogiri'

# Builds /canvas.json for the home page's canvas view: for every project,
# studio piece and note, pull the images, code blocks, quotes and a little
# text out of the rendered page so the canvas can lay them out as tiles.
#
# Runs after the site is written, because the fragments come from each
# page's converted HTML rather than its raw Markdown (so Obsidian embeds,
# includes and figures are already resolved).

module CanvasFragments
  module_function

  MAX_IMAGES = 8
  MAX_CODE = 2
  MAX_QUOTES = 2
  MAX_SNIPPETS = 3
  CODE_LINES = 10
  SNIPPET_CHARS = 260

  def entries(site)
    pages = site.pages.select { |p| p.path.include?('projects/') || p.path.include?('studio/') }
    notes = site.collections['notes']&.docs || []
    (pages + notes).select { |d| d.data['date'] }
  end

  def date_of(doc)
    date = doc.data['date']
    date = Time.parse(date.to_s) unless date.respond_to?(:strftime)
    date
  rescue StandardError
    nil
  end

  def local_path(site, src)
    clean = CGI.unescape(src.split(/[?#]/).first.delete_prefix('/'))
    File.join(site.source, clean)
  end

  def normalise_src(src)
    return src if src =~ %r{\A(https?:|//|data:)}

    src.start_with?('/') ? src : "/#{src}"
  end

  def squish(text)
    text.to_s.delete('↗').gsub(/\s+/, ' ').strip
  end

  def truncate(text, limit)
    return text if text.length <= limit

    cut = text[0, limit].sub(/\s+\S*\z/, '')
    "#{cut}…"
  end

  def images(site, html)
    seen = {}
    html.css('img').filter_map do |img|
      src = img['src'].to_s.strip
      next if src.empty? || src =~ /\.svg\z/i || src.start_with?('data:')

      src = normalise_src(src)
      next if seen[src]

      seen[src] = true
      size = src.start_with?('/') ? ImageDimensions.read(local_path(site, src)) : nil
      # Skip images that aren't on disk; the canvas needs a size to lay them out
      next unless size

      figure = img.ancestors('figure').first
      caption = figure&.at_css('figcaption')&.text
      {
        'kind' => 'image',
        'src' => src,
        'alt' => squish(img['alt']),
        'caption' => caption ? squish(caption) : nil,
        'w' => size[0],
        'h' => size[1],
        'invert' => img['class'].to_s.include?('invert-dark')
      }.compact
    end.first(MAX_IMAGES)
  end

  def code(html)
    html.css('pre').filter_map do |pre|
      text = pre.text.rstrip
      next if text.strip.empty?

      lines = text.lines
      body = lines.first(CODE_LINES).join.rstrip
      body += "\n…" if lines.length > CODE_LINES
      lang = (pre.at_css('code') || pre)['class'].to_s[/language-([\w-]+)/, 1] ||
             pre.ancestors.map { |a| a['class'].to_s[/language-([\w-]+)/, 1] }.compact.first
      { 'kind' => 'code', 'text' => body, 'lang' => lang }.compact
    end.first(MAX_CODE)
  end

  def quotes(html)
    html.css('blockquote').filter_map do |quote|
      text = squish(quote.text)
      next if text.length < 12

      { 'kind' => 'quote', 'text' => truncate(text, SNIPPET_CHARS) }
    end.first(MAX_QUOTES)
  end

  # Paragraphs that read as prose: not inside a figure, quote or callout,
  # and long enough to say something on their own.
  def snippets(html)
    html.css('p').filter_map do |p|
      next if p.ancestors.any? { |a| %w[figure blockquote figcaption].include?(a.name) || a['class'].to_s.include?('callout') }

      text = squish(p.text)
      next if text.length < 24

      { 'kind' => 'text', 'text' => truncate(text, SNIPPET_CHARS) }
    end.first(MAX_SNIPPETS)
  end

  def entry(site, doc)
    html = Nokogiri::HTML::DocumentFragment.parse(doc.content.to_s)
    note = doc.respond_to?(:collection) && doc.collection&.label == 'notes'
    date = date_of(doc)
    tags = Array(doc.data['tags']).compact.map { |t| t.to_s.downcase }

    description = squish(Nokogiri::HTML::DocumentFragment.parse(doc.data['description'].to_s).text)
    # The title tile already shows the description, so don't repeat it
    prose = snippets(html).reject { |s| s['text'].downcase.start_with?(description.downcase.chomp('.')) }

    fragments = images(site, html) + code(html) + quotes(html)
    # Notes are mostly words, so their text becomes the tiles. Projects get
    # one line of prose at most, so images stay the focus.
    fragments += note ? prose : prose.first(fragments.empty? ? 1 : 0)

    {
      'title' => doc.data['title'].to_s,
      'url' => "#{site.baseurl}#{doc.url}",
      'description' => description,
      'date' => date&.strftime('%b %Y'),
      'sort' => date&.strftime('%Y-%m-%d'),
      'tags' => tags,
      'type' => note ? 'note' : 'project',
      'fragments' => fragments
    }
  end

  def build(site)
    data = entries(site).map { |doc| entry(site, doc) }
                        .sort_by { |e| e['sort'].to_s }
                        .reverse
    { 'entries' => data }
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  path = File.join(site.dest, 'canvas.json')
  File.write(path, JSON.generate(CanvasFragments.build(site)))
end
