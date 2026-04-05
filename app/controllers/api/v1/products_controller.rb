module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: [:show, :update, :destroy]

      # GET /api/v1/products
      def index
        @products = Product.with_photo_url
        render json: { data: @products }
      end

      def sold
        start_date = parse_date(params[:start_date])
        end_date = parse_date(params[:end_date])

        if start_date.blank? || end_date.blank?
          render json: { error: 'start_date y end_date son obligatorios' }, status: :unprocessable_entity
          return
        end

        rows = products_sold_rows(start_date, end_date)
        render json: rows.map { |product_name, quantity_sold| { product_name: product_name, quantity: quantity_sold } }
      end

      # GET /api/v1/products/1
      def show
        render json: @product
      end

      # POST /api/v1/products
      def create
        @product = Product.new(product_params)

        if @product.save
          render json: @product, status: :created
        else
          render json: @product.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/products/1
      def update
        if @product.update(product_params)
          render json: @product
        else
          render json: @product.errors, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/products/1
      def destroy
        @product.destroy
        head :no_content
      end

      private
        def products_sold_rows(start_date, end_date)
          Ticket
            .joins(:order, :product)
            .where(orders: { date: start_date..end_date })
            .group('tickets.product_id', 'products.name')
            .order(Arel.sql('SUM(tickets.quantity) DESC'), 'products.name ASC')
            .pluck(
              'products.name',
              Arel.sql('SUM(tickets.quantity)')
            )
        end

        def parse_date(value)
          Date.iso8601(value.to_s)
        rescue ArgumentError
          nil
        end

        # Use callbacks to share common setup or constraints between actions.
        def set_product
          @product = Product.find(params[:id])
        end

        # Only allow a trusted parameter "white list" through.
        def product_params
          params.require(:product).permit(:name, :price, :price_members, :price_tikis, :photo, :stockable)
        end
    end
  end
end
