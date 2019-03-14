Rails.application.routes.draw do
  # to check routes: http://localhost:3001/rails/info/routes
  get 'resume' => "resume#index"
  get 'resume/:id/older_jobs', to: "resume#older_jobs", as: 'older_jobs'
end
