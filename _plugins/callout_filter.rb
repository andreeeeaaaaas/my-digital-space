# frozen_string_literal: true
require 'nokogiri'

module Jekyll
  module CalloutFilter
    def callout_excerpt(input)
      return '' if input.nil? || input.empty?

      # Parse HTML content using Nokogiri
      doc = Nokogiri::HTML.fragment(input)

      # Find the first div with class "callout"
      callout = doc.at_css('.callout')

      # Return the text content, stripping extra whitespace
      callout ? callout.text.strip : ''
    end
  end
end

Liquid::Template.register_filter(Jekyll::CalloutFilter)
