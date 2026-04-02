module Api
  module V1
    class ProductQuantitiesController < ApplicationController
      def index
        @product_quantities = ProductQuantity.includes(:product).all
        render json: @product_quantities, each_serializer: ProductQuantitySerializer
      end

      def show
        @product_quantity = ProductQuantity.find(params[:id])
        render json: @product_quantity
      end

      def create
        @product_quantity = ProductQuantity.new(product_quantity_params)

        if @product_quantity.save
          render json: @product_quantity, status: :created
        else
          render json: @product_quantity.errors, status: :unprocessable_entity
        end
      end

      def update
        @product_quantity = ProductQuantity.find(params[:id])
        if @product_quantity.update(product_quantity_params)
          render json: @product_quantity
        else
          render json: @product_quantity.errors, status: :unprocessable_entity
        end
      end

      private

      def product_quantity_params
        params.require(:product_quantity).permit(:product_id, :quantity)
      end
    end
  end
end

