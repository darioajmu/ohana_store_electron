class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.boolean :member, null: false, default: false

      t.timestamps
    end
  end
end
