require 'net/http'

class ResumeController < ApplicationController
    def index
        @response = {}

        if MyResumeWeb::Application.config.resume_user.nil? 
            Rails.logger.warn("resume_user constant missing")
            render :file => 'public/500.html', :status => 500, :layout => false and return
        end
        
        root_url = Rails.application.config.api_root
        resume_user = Rails.application.config.resume_user

        user_info = fetch_user_info root_url: root_url, resume_user: resume_user
        process_personal_info user_info[:info]
        process_education user_info[:education]
        process_highlights user_info[:highlights]
        process_resume user_info[:resume]

        # @response[:resume] has what we need. no need to pass as a param
        fetch_resume root_url: root_url
    end

    private 

    def fetch_user_info(root_url:, resume_user:)
        threads = []

        t1 = Thread.new do 
            uri = URI.parse "#{root_url}/person/#{resume_user}/info.json"
            resp = Net::HTTP.get(uri)
            Thread.current[:response] = resp
        end
        threads << t1
        
        t2 = Thread.new do
            uri = URI.parse "#{root_url}/person/#{resume_user}/education.json"
            resp = Net::HTTP.get(uri)
            Thread.current[:response] = resp
        end
        threads << t2

        t3 = Thread.new do
            uri = URI.parse "#{root_url}/person/#{resume_user}/highlights.json"
            resp = Net::HTTP.get(uri)
            Thread.current[:response] = resp
        end
        threads << t3

        t4 = Thread.new do
            uri = URI.parse "#{root_url}/person/#{resume_user}/resume.json"
            resp = Net::HTTP.get(uri)
            Thread.current[:response] = resp
        end
        threads << t4

        threads.each { |th| th.join }
        
        resp1 = t1[:response]
        resp2 = t2[:response]
        resp3 = t3[:response]
        resp4 = t4[:response]
        
        {:info => resp1, :education => resp2, :highlights => resp3, :resume => resp4}  
    end

    def process_api_response(api_response)
        begin
            resp =  ActiveSupport::JSON.decode(api_response)
            yield resp
        rescue ActiveSupport::JSON.parse_error
            Rails.logger.warn("Attempted to decode invalid JSON: #{api_response}")
            render :file => 'public/500.html', :status => 500, :layout => false
        end
    end

    def process_personal_info(api_response)
        process_api_response(api_response) do |json|
            resp = json
            full_name = resp['name']
            parts = full_name.split(' ')
            resp['first_name'] = parts[0]
            resp['last_name'] = parts[1]
            @response[:personal_info] = resp
        end
    end

    def process_education(api_response) 
        process_api_response(api_response) do |json|
            resp = json[0]
            degree = resp['title'].split(', ')
            resp['major'] = degree[0]
            resp['minor'] = degree[1]
            resp.delete 'title'
            @response[:education] = resp
        end
    end

    def process_highlights(api_response)
        process_api_response(api_response) do |json|
           @response[:highlights] = json 
        end
    end

    def process_resume(api_response)
        process_api_response(api_response) do |json|
            @response[:resume] = json
        end
    end

    def fetch_resume(root_url:)
        t = Thread.new do
            five_years_ago = 5.years.ago.strftime '%-m/%-y/%Y'
            uri = URI.parse "#{root_url}/resume/#{@response[:resume]['resume']}/jobs.json?since=#{five_years_ago}"
            resp = Net::HTTP.get(uri)
            Thread.current[:response] = resp
        end
        t.join
        
        process_api_response(t[:response]) do |json|
            @response[:resume] = json
        end
    end
end
