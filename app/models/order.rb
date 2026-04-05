class Order < ApplicationRecord
  belongs_to :user, optional: true
  has_many :tickets

  accepts_nested_attributes_for :tickets
  validates :user_id, presence: true, unless: :paid?, on: :create

  def self.create_or_update_order(order_params)
    order_params[:date] = Date.today
    return create(order_params) if create_new_order?(order_params)

    order = find_or_initialize_order(order_params)
    transaction do
      order.save!
      create_tickets_and_update_total(order, order_params)
      raise ActiveRecord::Rollback if order.errors.any?
    end

    order
  rescue ActiveRecord::RecordInvalid => e
    e.record
  end

  def update_pending_items(tickets_attributes)
    errors.clear

    if paid?
      errors.add(:base, 'Solo se pueden editar compras pendientes')
      return self
    end

    normalized_tickets = normalize_tickets_attributes(tickets_attributes)

    transaction do
      update_tickets!(normalized_tickets)
      update!(total: tickets.reload.sum(&:total))
    end

    self
  rescue ActiveRecord::RecordInvalid => e
    errors.add(:base, e.record.errors.full_messages.to_sentence) if e.record.errors.any?
    self
  rescue StandardError => e
    errors.add(:base, e.message)
    self
  end

  private

  def self.create_new_order?(order_params)
    order_params[:paid] || order_params[:user_id].blank?
  end

  def self.find_or_initialize_order(order_params)
    find_or_initialize_by(date: order_params[:date], paid: false, user_id: order_params[:user_id])
  end

  def self.create_tickets_and_update_total(order, order_params)
    order_params[:tickets_attributes].each do |ticket|
      new_ticket = order.tickets.find_or_initialize_by(product_id: ticket[:product_id])
      new_ticket.quantity ||= 0
      new_ticket.quantity += ticket[:quantity]
      new_ticket.price = ticket[:price]
      next if new_ticket.save

      new_ticket.errors.full_messages.each do |error_message|
        order.errors.add(:base, error_message)
      end

      raise ActiveRecord::Rollback
    end

    order.update(total: order.tickets.sum(&:total))
  end

  def normalize_tickets_attributes(tickets_attributes)
    tickets_attributes
      .map { |ticket| ticket.to_h.symbolize_keys }
      .each_with_object({}) do |ticket, normalized|
        product_id = ticket[:product_id].to_i
        quantity = ticket[:quantity].to_i
        price = ticket[:price].to_d

        next if product_id <= 0 || quantity <= 0 || price <= 0

        normalized[product_id] = { quantity: quantity, price: price }
      end
  end

  def update_tickets!(normalized_tickets)
    existing_tickets = tickets.includes(:product).index_by(&:product_id)
    desired_product_ids = normalized_tickets.keys

    existing_tickets.each do |product_id, ticket|
      desired_ticket = normalized_tickets[product_id]

      if desired_ticket.blank?
        ticket.destroy!
        next
      end

      next if ticket.quantity == desired_ticket[:quantity] && ticket.price.to_d == desired_ticket[:price].to_d

      ticket.update!(quantity: desired_ticket[:quantity], price: desired_ticket[:price])
    end

    (desired_product_ids - existing_tickets.keys).each do |product_id|
      product = Product.find(product_id)

      tickets.create!(
        product: product,
        quantity: normalized_tickets[product_id][:quantity],
        price: normalized_tickets[product_id][:price]
      )
    end
  end
end
