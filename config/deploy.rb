# Automatically precompile assets
load "deploy/assets"
 
# Execute "bundle install" after deploy, but only when really needed
require "bundler/capistrano"
 
# RVM integration
set :rvm_type, :system
set :rvm_ruby_string, :local
require "rvm/capistrano"
 
set :application, "Kanji"
set :repository,  "ssh://deploy@chad.liammitchell.co.nz/var/git/kanji.git"
set :user, "deploy"
set :scm, :git 

set :deploy_to, "/var/www/kanji"

role :web, "kanji.liammitchell.co.nz"                          # Your HTTP server, Apache/etc
role :app, "kanji.liammitchell.co.nz"                          # This may be the same as your `Web` server
role :db,  "kanji.liammitchell.co.nz", :primary => true # This is where Rails migrations will run

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
