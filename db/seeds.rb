# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

PRODUCTS = [
  {name: "Agua", price: 1, price_members: 0.5, price_tikis: 0, stockable: true},
  {name: "Alcohol", price: 4, price_members: 3, price_tikis: 2, stockable: false},
  {name: "Aquarius", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Chupito NORMAL", price: 2, price_members: 1.5, price_tikis: 1, stockable: false},
  {name: "Chupito PREMIUM", price: 2.5, price_members: 2, price_tikis: 1, stockable: false},
  {name: "Coca Cola Zero", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Coca Cola Zero Zero", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Fanta", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Mahou Clasica", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Sprite", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Tonica Schweppes", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Vino Blanco", price: 2, price_members: 1.5, price_tikis: 1, stockable: true},
  {name: "Vino Tinto", price: 2, price_members: 1.5, price_tikis: 1, stockable: true}
]

PRODUCTS.each do |product|
  new_product = Product.find_or_create_by(name: product[:name])
  new_product.price = product[:price]
  new_product.price_members = product[:price_members]
  new_product.price_tikis = product[:price_tikis]
  new_product.stockable = product[:stockable]

  file_name = product[:name].downcase.gsub(' ', '-') + '.jpeg'

  new_product.photo.attach(io: File.open(Rails.root.join('public/product_images', file_name)), filename: file_name, content_type: 'image/jpeg')

  new_product.save
end
