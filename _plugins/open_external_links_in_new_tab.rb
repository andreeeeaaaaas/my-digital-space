# Marks external links so they can be styled and opened in a new tab.
#
# Runs after markdown → HTML conversion on notes (_notes) and pages (_pages/).
# Parses the output with Nokogiri and, for every <a> that is NOT one of the
# "internal" kinds (.internal-link, .footnote, .reversefootnote, .nav-link,
# .card, .element-link), does two things:
#   1. Adds target="_blank" so it opens in a new tab.
#   2. Adds class="external" and injects the ↗ icon into the link's last word,
#      wrapped in a nowrap span so the icon never orphans on its own line.
#
# Controlled by the `open_external_links_in_new_tab` flag in _config.yml.
# Note: Jekyll loads plugins once at server start, so restart `jekyll serve`
# after editing this file. Links inside _layouts are not touched.

# frozen_string_literal: true
require 'nokogiri'

Jekyll::Hooks.register [:notes], :post_convert do |doc|
  convert_links(doc)
end

Jekyll::Hooks.register [:pages], :post_convert do |doc|
  # jekyll considers anything at the root as a page,
  # we only want to consider actual pages
  next unless doc.path.start_with?('_pages/')
  convert_links(doc)
end

def convert_links(doc)
  open_external_links_in_new_tab = !!doc.site.config["open_external_links_in_new_tab"]

  if open_external_links_in_new_tab
    parsed_doc = Nokogiri::HTML(doc.content)
    parsed_doc.css("a:not(.internal-link):not(.footnote):not(.reversefootnote):not(.nav-link):not(.card):not(.element-link)").each do |link|
      link.set_attribute('target', '_blank')
      classes = link['class'].to_s.split
      unless classes.include?('external')
        link['class'] = (classes + ['external']).join(' ')
      end
      inject_external_icon(link)
    end
    doc.content = parsed_doc.inner_html
  end
end

def inject_external_icon(link)
  last_text_node = link.xpath('.//text()').last
  return unless last_text_node

  text = last_text_node.content
  match = text.match(/\A(.*?)(\S+)(\s*)\z/m)
  return unless match

  before_text = match[1]
  last_word   = match[2]

  # Replace the text node with: before_text + <span class="nowrap-icon">last_word<span class="ext-icon">↗</span></span>
  before_node = Nokogiri::XML::Text.new(before_text, link.document)

  nowrap_span = Nokogiri::XML::Node.new('span', link.document)
  nowrap_span['class'] = 'nowrap-icon'
  nowrap_span.add_child(Nokogiri::XML::Text.new(last_word, link.document))

  icon_span = Nokogiri::XML::Node.new('span', link.document)
  icon_span['class'] = 'ext-icon'
  icon_span['aria-hidden'] = 'true'
  icon_span.add_child(Nokogiri::XML::Text.new('↗', link.document))
  nowrap_span.add_child(icon_span)

  last_text_node.replace(before_node)
  before_node.add_next_sibling(nowrap_span)
end
