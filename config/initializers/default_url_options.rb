host = ENV.fetch("OHANA_API_HOST", "127.0.0.1")
port = ENV["OHANA_API_PORT"]
protocol = ENV.fetch("OHANA_API_PROTOCOL", "http")

default_url_options = {
  host: host,
  protocol: protocol,
}

default_url_options[:port] = port if port.present?

Rails.application.routes.default_url_options = default_url_options
