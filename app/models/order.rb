class Order < ApplicationRecord
  has_many :tickets

  accepts_nested_attributes_for :tickets

  def self.create_or_update_order(order_params)
    order_params[:date] = Date.today
    return create(order_params) if create_new_order?(order_params)

    order = find_or_initialize_order(order_params)

    order.save
    create_tickets_and_update_total(order, order_params)

    order
  end

  private

  def self.create_new_order?(order_params)
    order_params[:paid] || order_params[:debtor_name].blank?
  end

  def self.find_or_initialize_order(order_params)
    find_or_initialize_by(date: order_params[:date], debtor_name: order_params[:debtor_name], paid: false)
  end

  def self.create_tickets_and_update_total(order, order_params)
    order_params[:tickets_attributes].each do |ticket|
      new_ticket = order.tickets.find_or_create_by(product_id: ticket[:product_id])
      new_ticket.quantity ||= 0
      new_ticket.quantity += ticket[:quantity]
      new_ticket.price = ticket[:price]
      new_ticket.save
    end
    order.update(total: order.tickets.sum(&:total))
  end
end
