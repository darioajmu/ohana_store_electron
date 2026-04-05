module Api
  module V1
    class OrdersController < ApplicationController
      before_action :set_order, only: [:update, :update_pending_items]

      # GET /api/v1/orders
      def index
        @orders = Order.includes(:user, tickets: :product).all
        render json: @orders, each_serializer: OrderSerializer
      end

      def paid
        @orders = Order.includes(:user, tickets: :product).where(paid: true)
        render json: @orders, each_serializer: OrderSerializer
      end

      def not_paid
        @orders = Order.includes(:user, tickets: :product).where(paid: false)
        render json: @orders, each_serializer: OrderSerializer
      end

      # POST /api/v1/orders
      def create
        @order = Order.create_or_update_order(order_params)

        if @order.errors.empty?
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

      def update_pending_items
        @order.update_pending_items(update_pending_items_params[:tickets_attributes] || [])

        if @order.errors.empty?
          render json: @order.reload, serializer: OrderSerializer
        else
          render json: @order.errors, status: :unprocessable_entity
        end
      end

      private
        # Use callbacks to share common setup or constraints between actions.
        def set_order
          @order = Order.find(params[:id])
        end

        # Only allow a trusted parameter "white list" through.
        def order_params
          params.require(:order).permit(:total, :paid, :date, :user_id, tickets_attributes: [:quantity, :product_id, :price])
        end

        def update_pending_items_params
          params.require(:order).permit(tickets_attributes: [:quantity, :product_id, :price])
        end
    end
  end
end
