class SessionsController < ApplicationController
  # sign in page (called on sign in failure)
  def new
    respond_to do |format|
      format.html
      # if called by ajax, just provide a simple failure
      format.json { render json: false }
    end
  end
  
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)
    session[:user_id] = user.id
    respond_to do |format|
      format.html { redirect_to root_url, :notice => "Signed in" }
      format.json { render json: user.as_json }
    end
  end
  
  def destroy
    session[:user_id] = nil
    respond_to do |format|
      format.html { redirect_to root_url, :notice => "Signed out" }
      format.json { render json: true }
    end
  end
end
