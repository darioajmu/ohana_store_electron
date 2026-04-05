module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :update, :destroy]

      def index
        @users = User.order(:name)
        render json: @users, each_serializer: UserSerializer
      end

      def search
        query = params[:q].to_s.strip
        @users = if query.length < 3
                   []
                 else
                   User.enabled.where('LOWER(name) LIKE ?', "%#{query.downcase}%").order(:name).limit(20)
                 end

        render json: @users, each_serializer: UserSerializer
      end

      def show
        render json: @user, serializer: UserSerializer
      end

      def create
        @user = User.new(user_params)

        if @user.save
          render json: @user, serializer: UserSerializer, status: :created
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      def update
        if @user.update(user_params)
          render json: @user, serializer: UserSerializer
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      def destroy
        if @user.update(disabled: true)
          render json: @user, serializer: UserSerializer
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(:name, :member, :disabled)
      end
    end
  end
end
