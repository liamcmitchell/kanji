class IdentitiesController < ApplicationController
  def new
    @identity = env['omniauth.identity']

    # Check for errors and send appropriate response.
    if @identity.errors.any?
    	render json: {errors: @identity.errors.full_messages}, status: :forbidden
    else
    	render json: @identity
    end
  end
end
