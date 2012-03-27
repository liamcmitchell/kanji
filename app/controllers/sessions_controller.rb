class SessionsController < ApplicationController
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)
    session[:user_id] = user.id
    respond_to do |format|
      format.html { redirect_to root_url, :notice => "Signed in" }
      format.json { render json: true }
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
