class Ticket < ApplicationRecord
  belongs_to :order
  belongs_to :product

  after_save :decrement_product_quantity

  def total
    quantity * price
  end

  private
  def decrement_product_quantity
    return if !product.stockable
    product_quantity = product.product_quantity

    if product_quantity.present? && product_quantity.quantity > 0
      product_quantity.update(quantity: product_quantity.quantity - quantity)
    else
      errors.add(:base, "Product quantity record not found for product_id: #{product_id}")
    end
  end
end
