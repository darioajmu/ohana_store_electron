class TicketSerializer < ActiveModel::Serializer
  attributes :product_id, :quantity, :product_name, :price, :total, :stockable, :available_stock

  belongs_to :product

  def product_name
    object.product.name if object.product
  end

  def total
    object.price * object.quantity if object.product
  end

  def stockable
    object.product&.stockable || false
  end

  def available_stock
    return 0 unless object.product&.stockable

    object.product.product_quantity&.quantity.to_i + object.quantity.to_i
  end
end
