class AddStockableFieldToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :stockable, :boolean, default: true
  end
end
