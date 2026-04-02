require_relative "production"

Rails.application.configure do
  config.force_ssl = false
  config.public_file_server.enabled = true
  config.require_master_key = false
  config.active_storage.service = :desktop_local

  config.hosts << "127.0.0.1"
  config.hosts << "localhost"
end
