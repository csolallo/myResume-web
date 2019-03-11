module ResumeHelper
    def company_for(job, in_companies:)
        in_companies.find { |company| company['id'] == job['company_id'] }
    end

    def format_date(job_date)
        the_date = DateTime.iso8601 job_date
        the_date.strftime '%B %Y'
    end
end