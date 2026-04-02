class ProductQuantitySerializer < ActiveModel::Serializer
  attributes :id, :quantity, :product_name

  def product_name
    object.product.name if object.product
  end
end
