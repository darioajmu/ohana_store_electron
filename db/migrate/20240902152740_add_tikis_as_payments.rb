class AddTikisAsPayments < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :price_tikis, :integer 
  end
end
