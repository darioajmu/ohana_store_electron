class OrderSerializer < ActiveModel::Serializer
  attributes :id, :paid, :total, :debtor_name, :date

  has_many :tickets, serializer: TicketSerializer
end
