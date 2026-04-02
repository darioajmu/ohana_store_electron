class TicketSerializer < ActiveModel::Serializer
  attributes :quantity, :product_name, :price, :total

  belongs_to :product

  def product_name
    object.product.name if object.product
  end

  def total
    object.price * object.quantity if object.product
  end
end
