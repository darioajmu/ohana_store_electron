class OrderSerializer < ActiveModel::Serializer
  attributes :id, :paid, :total, :debtor_name, :date, :user_id, :user_name, :user_member

  has_many :tickets, serializer: TicketSerializer

  def user_name
    object.user&.name
  end

  def user_member
    object.user&.member || false
  end
end
