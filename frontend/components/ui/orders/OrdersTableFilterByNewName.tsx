import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { UserEntity } from '../../../domain/entities/user/user.entity';
import { userRequests } from '../../../requests/user/userRequests';

const OrdersTableFilterByNewName = () => {
  const { newNameFilterValue, setNewNameFilterValue, setPage } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState<UserEntity[]>([]);
  const shouldShowUsers = inputValue.trim().length >= 3;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!shouldShowUsers) {
        setUsers([]);
        return;
      }

      const { searchUsers } = userRequests();
      const response = await searchUsers(inputValue.trim());

      if (response.status === 200) {
        setUsers(response.data);
      }
    };

    fetchUsers();
  }, [inputValue, shouldShowUsers]);

  const onInputChange = (value?: string) => {
    setInputValue(value || '');
  };

  const onSelectionChange = (value: string | null) => {
    setNewNameFilterValue(value || '');
    setInputValue(value || '');
    setPage(1);
  };

  const onClear = () => {
    setInputValue('');
    setNewNameFilterValue('');
  };

  return (
    <Autocomplete
      className='max-w-xs'
      isClearable
      classNames={{ inputWrapper: 'h-14 min-h-14' }}
      defaultItems={shouldShowUsers ? users : []}
      emptyContent={shouldShowUsers ? 'No se han encontrado usuarios' : 'Escribe al menos 3 letras'}
      label='Buscar por nombre nuevo'
      inputValue={inputValue}
      selectedKey={newNameFilterValue || null}
      onSelectionChange={(key) => onSelectionChange(key ? String(key) : null)}
      onInputChange={onInputChange}
      onClear={onClear}
    >
      {(user: UserEntity) => <AutocompleteItem key={user.name}>{user.name}</AutocompleteItem>}
    </Autocomplete>
  );
};

export default OrdersTableFilterByNewName;
