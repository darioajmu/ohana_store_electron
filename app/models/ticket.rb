class Ticket < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validate :stock_availability

  after_save :sync_product_quantity
  after_destroy :restore_product_quantity

  def total
    quantity * price
  end

  private
  def stock_availability
    return unless product&.stockable

    quantity_change = quantity_change_to_be_saved
    requested_quantity = quantity_change.present? ? quantity_change.last.to_i - quantity_change.first.to_i : 0
    return if requested_quantity <= 0

    product_quantity = product.product_quantity
    product_quantity&.lock! if product_quantity&.persisted?

    if product_quantity.blank?
      errors.add(:base, "No stock entry found for product_id: #{product_id}")
    elsif product_quantity.quantity < requested_quantity
      errors.add(:base, "Insufficient stock for product_id: #{product_id}")
    end
  end

  def sync_product_quantity
    return unless product.stockable

    quantity_change = saved_change_to_quantity
    quantity_delta = quantity_change.present? ? quantity_change.last.to_i - quantity_change.first.to_i : 0
    return if quantity_delta.zero?

    product_quantity = product.product_quantity
    product_quantity&.lock! if product_quantity&.persisted?

    if product_quantity.present?
      product_quantity.update!(quantity: product_quantity.quantity - quantity_delta)
    else
      errors.add(:base, "Product quantity record not found for product_id: #{product_id}")
    end
  end

  def restore_product_quantity
    return unless product&.stockable

    product_quantity = product.product_quantity
    product_quantity&.lock! if product_quantity&.persisted?
    return if product_quantity.blank?

    product_quantity.update!(quantity: product_quantity.quantity + quantity.to_i)
  end
end
