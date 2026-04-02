class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.decimal :total, precision: 8, scale: 2
      t.boolean :paid
      t.string :debtor_name
      t.date :date

      t.timestamps
    end
  end
end
