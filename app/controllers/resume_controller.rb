require 'fiber'
require 'net/http'

class ResumeController < ApplicationController
    def index
        unless MyResumeWeb::Application.config.respond_to? :resumeUser 
            render 'public/500.html', :status => 500 and return
        end

        fiber = Fiber.new do |user|
            Fiber.yield 'hello there'
        end

        response = fiber.resume

        render :index
    end
end
