# modify identity failure call
module OmniAuth
  module Strategies
    class Identity
    
      option :on_failed_verification, nil
      
      def callback_phase
        if identity
          return super
        else
          if options[:on_failed_verification]
            options[:on_failed_verification].call(self.env)
          else
            fail!(:invalid_credentials)
          end
        end
      end
      
    end
  end
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :identity, 
    :on_failed_registration => IdentitiesController.action(:new),
    :on_failed_verification => SessionsController.action(:error)
end
