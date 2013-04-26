source 'https://rubygems.org'

gem "rails", "~> 3.2.12"

# XML library for importing kanji (rake task)
gem 'nokogiri'

# Authentication management
gem 'omniauth-identity'
gem 'bcrypt-ruby', '~> 3.0.0'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  
  # Javascript support
  gem 'execjs'
  gem 'therubyracer'
  
  # Javascript
  gem 'jquery-rails', "~> 2.1.3"
  gem "rails-backbone", "~> 0.9.10"
  gem 'handlebars_assets'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'uglifier', '>= 1.0.3'

  # CSS
  gem "less-rails"
  gem "twitter-bootstrap-rails"

end

group :production do

  gem 'mysql2'

end

group :development do

  gem 'sqlite3'
  
  # Deploy with Capistrano
  gem 'capistrano'
  gem 'rvm-capistrano'
  
  gem 'debugger'

end
