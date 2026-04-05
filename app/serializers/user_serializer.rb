class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :member, :disabled
end
