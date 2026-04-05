class Product < ApplicationRecord
  validates :price,
            :price_members,
            # :price_tikis,
            :name,
            presence: :true
  attribute :photo_url
  attribute :available_stock
  attribute :available_for_sale

  has_many :tickets
  has_one_attached :photo
  has_one :product_quantity, dependent: :destroy

  after_create :create_product_quantity, if: :stockable?

  def self.with_photo_url
    all.each do |product|
      product['photo_url'] = Rails.application.routes.url_helpers.url_for(product.photo)
      product['available_stock'] = product.product_quantity&.quantity || 0
      product['available_for_sale'] = !product.stockable? || product.product_quantity&.quantity.to_i > 0
    end
  end

  private

  def create_product_quantity
    ProductQuantity.create(product_id: self.id, quantity: 0)
  end
end
