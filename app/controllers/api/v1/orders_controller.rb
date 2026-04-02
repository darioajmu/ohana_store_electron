module Api
  module V1
    class OrdersController < ApplicationController
      before_action :set_order, only: [:update]
      before_action :set_tickets_price, only: [:create]

      # GET /api/v1/orders
      def index
        @orders = Order.includes(tickets: :product).all
        render json: @orders, each_serializer: OrderSerializer
      end

      # POST /api/v1/orders
      def create
        @order = Order.create_or_update_order(order_params)

        if @order.save
          render json: @order, status: :created
        else
          render json: @order.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/orders/1
      def update
        if @order.update(order_params)
          render json: @order
        else
          render json: @order.errors, status: :unprocessable_entity
        end
      end

      private
        # Use callbacks to share common setup or constraints between actions.
        def set_order
          @order = Order.find(params[:id])
        end

        def set_tickets_price
          if params[:order][:member]
            params[:order][:tickets_attributes].each do |ticket_attributes|
              ticket_attributes[:price] = ticket_attributes[:price_members]
            end
          end
        end

        # Only allow a trusted parameter "white list" through.
        def order_params
          params.require(:order).permit(:total, :paid, :debtor_name, :date, tickets_attributes: [:quantity, :product_id, :price])
        end
    end
  end
end
