require 'net/http'

class ResumeController < ApplicationController
    def index
        if MyResumeWeb::Application.config.resume_user.nil? 
            Rails.logger.warn("resume_user constant missing")
            render :file => 'public/500.html', :status => 500, :layout => false and return
        end
        
        t1 = Thread.new do 
            root_url = Rails.application.config.api_root
            resume_user = Rails.application.config.resume_user
            uri = URI.parse "#{root_url}/person/#{resume_user}/info.json"
            resp = Net::HTTP.get(uri)
            
            Thread.current[:response] = resp
        end
        
        t1.join
        
        resp = t1[:response]
        begin
            obj = ActiveSupport::JSON.decode(resp)
            @response = ActiveSupport::JSON.decode(obj)
            render :index
        rescue ActiveSupport::JSON.parse_error
            Rails.logger.warn("Attempted to decode invalid JSON: #{resp}")
            render :file => 'public/500.html', :status => 500, :layout => false
        end
    end
end
