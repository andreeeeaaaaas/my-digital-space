# frozen_string_literal: true

require 'cgi'

# Adds width and height to local <img> tags that have neither, so the
# browser reserves their space and the page doesn't jump as images load.

module ImageDimensions
  module_function

  def read(path)
    File.open(path, 'rb') do |f|
      head = f.read(32) || ''
      if head.start_with?("\x89PNG".b)
        head[16, 8].unpack('NN')
      elsif head.start_with?('GIF')
        head[6, 4].unpack('vv')
      elsif head[0, 4] == 'RIFF' && head[8, 4] == 'WEBP'
        webp(head)
      elsif head.start_with?("\xFF\xD8".b)
        f.seek(2)
        jpeg(f)
      end
    end
  rescue StandardError
    nil
  end

  def webp(head)
    case head[12, 4]
    when 'VP8 '
      head[26, 4].unpack('vv').map { |n| n & 0x3fff }
    when 'VP8L'
      bits = head[21, 4].unpack1('V')
      [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]
    when 'VP8X'
      w = head[24, 3].unpack('C3')
      h = head[27, 3].unpack('C3')
      [1 + w[0] + (w[1] << 8) + (w[2] << 16), 1 + h[0] + (h[1] << 8) + (h[2] << 16)]
    end
  end

  def jpeg(f)
    loop do
      marker = f.read(2)&.unpack('CC') or return
      return unless marker[0] == 0xFF
      length = f.read(2).unpack1('n')
      if (0xC0..0xCF).cover?(marker[1]) && ![0xC4, 0xC8, 0xCC].include?(marker[1])
        h, w = f.read(5).unpack('xnn')
        return [w, h]
      end
      f.seek(length - 2, IO::SEEK_CUR)
    end
  end

  def apply(site, html)
    html.gsub(/<img\b[^>]*>/i) do |tag|
      next tag if tag =~ /\s(width|height)=/i
      src = tag[/\ssrc=["']([^"']+)["']/i, 1]
      next tag if src.nil? || src =~ %r{\A(https?:|//|data:)} || src =~ /\.svg\z/i
      path = File.join(site.source, CGI.unescape(src.split(/[?#]/).first.delete_prefix('/')))
      size = File.file?(path) && read(path)
      next tag unless size
      tag.sub(/\s*\/?>\z/) { |close| " width=\"#{size[0]}\" height=\"#{size[1]}\"#{close}" }
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == '.html' && doc.output
  doc.output = ImageDimensions.apply(doc.site, doc.output)
end
