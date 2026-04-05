Rails.application.routes.draw do
  match '*all', controller: 'application', action: 'cors_preflight_check', via: [:options]
  namespace :api do
    namespace :v1 do
      resources :products do
        get 'sold', on: :collection
      end
      resources :users do
        get 'search', on: :collection
      end
      resources :tickets
      resources :product_quantities
      
      resources :orders do
        get 'by_user', on: :collection
        get 'by_date', on: :collection
        get 'paid', on: :collection
        get 'not_paid', on: :collection
        patch 'update_pending_items', on: :member
      end
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
