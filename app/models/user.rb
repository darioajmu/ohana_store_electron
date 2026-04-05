class User < ApplicationRecord
  has_many :orders, dependent: :nullify

  validates :name, presence: true

  scope :enabled, -> { where(disabled: false) }
end
