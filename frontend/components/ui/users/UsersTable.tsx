'use client';

import {
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { UserEntity } from '../../../domain/entities/user/user.entity';
import { userRequests } from '../../../requests/user/userRequests';
import UserFormDialog from './UserFormDialog';

const UsersTable = () => {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);
  const [nameFilterValue, setNameFilterValue] = useState('');
  const [memberFilterValue, setMemberFilterValue] = useState('all');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
    onClose: onCreateClose,
  } = useDisclosure();

  useEffect(() => {
    const fetchUsers = async () => {
      const { getUsers } = userRequests();
      const response = await getUsers();

      if (response.status === 200) {
        setUsers(response.data);
      }
    };

    fetchUsers();
  }, []);

  const refreshUsers = async () => {
    const { getUsers } = userRequests();
    const response = await getUsers();

    if (response.status === 200) {
      setUsers(response.data);
    }
  };

  const onEditOpen = (user: UserEntity) => {
    setSelectedUser(user);
    onOpen();
  };

  const onEditUser = async (user: { name: string; member: boolean }) => {
    if (!selectedUser) return;

    if (!user.name) {
      toast.error('Introduce un nombre para el usuario');
      return;
    }

    try {
      const { editUser, getUsers } = userRequests();
      const response = await editUser(selectedUser.id, {
        user,
      });

      if (response.status === 200) {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data);
        onClose();
        toast.success('Usuario editado correctamente');
      }
    } catch (_error) {
      toast.error('No se ha podido editar el usuario');
    }
  };

  const onCreateUser = async (user: { name: string; member: boolean }) => {
    if (!user.name) {
      toast.error('Introduce un nombre para el usuario');
      return;
    }

    try {
      const { saveUser } = userRequests();
      const response = await saveUser({
        user,
      });

      if (response.status === 201) {
        await refreshUsers();
        onCreateClose();
        toast.success('Usuario creado correctamente');
      }
    } catch (_error) {
      toast.error('No se ha podido crear el usuario');
    }
  };

  const onToggleUserDisabled = async (user: UserEntity) => {
    try {
      const { editUser, disableUser } = userRequests();
      const response = user.disabled
        ? await editUser(user.id, {
            user: {
              name: user.name,
              member: user.member,
              disabled: false,
            },
          })
        : await disableUser(user.id);

      if (response.status === 200) {
        await refreshUsers();
        toast.success(user.disabled ? 'Usuario habilitado correctamente' : 'Usuario deshabilitado correctamente');
      }
    } catch (_error) {
      toast.error('No se ha podido actualizar el usuario');
    }
  };

  const columns = [
    { name: 'Nombre', uid: 'name' },
    { name: 'Asociado', uid: 'member' },
    { name: 'Estado', uid: 'disabled' },
    { name: 'Acciones', uid: 'actions' },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesName = user.name.toLowerCase().includes(nameFilterValue.toLowerCase());
      const matchesMember =
        memberFilterValue === 'all' ||
        (memberFilterValue === 'yes' && user.member) ||
        (memberFilterValue === 'no' && !user.member);

      return matchesName && matchesMember;
    });
  }, [memberFilterValue, nameFilterValue, users]);

  return (
    <>
      <div className='flex items-end gap-4 mb-4'>
        <Button className='h-14 min-h-14' color='primary' onPress={onCreateOpen}>
          Crear
        </Button>
        <Input
          className='max-w-xs'
          classNames={{ inputWrapper: 'h-14 min-h-14' }}
          isClearable
          label='Buscar por nombre'
          value={nameFilterValue}
          onValueChange={setNameFilterValue}
          onClear={() => setNameFilterValue('')}
        />
        <Select
          className='max-w-xs'
          classNames={{ trigger: 'h-14 min-h-14' }}
          label='Filtrar asociado'
          selectedKeys={[memberFilterValue]}
          onChange={(event) => setMemberFilterValue(event.target.value)}
        >
          <SelectItem key='all'>Todos</SelectItem>
          <SelectItem key='yes'>Si</SelectItem>
          <SelectItem key='no'>No</SelectItem>
        </Select>
      </div>
      <Table aria-label='Tabla de usuarios' isStriped>
        <TableHeader columns={columns}>
          {(column: any) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody emptyContent={'No se han encontrado usuarios'} items={filteredUsers}>
          {(item: UserEntity) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.member ? 'Si' : 'No'}</TableCell>
              <TableCell>{item.disabled ? 'Deshabilitado' : 'Activo'}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button color='primary' onPress={() => onEditOpen(item)}>
                    Editar
                  </Button>
                  <Button color={item.disabled ? 'success' : 'danger'} variant='light' onPress={() => onToggleUserDisabled(item)}>
                    {item.disabled ? 'Habilitar' : 'Deshabilitar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <UserFormDialog
        isOpen={isOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        onSubmit={onEditUser}
        title='Editar usuario'
        submitLabel='Guardar'
        initialName={selectedUser?.name}
        initialMember={selectedUser?.member}
      />
      <UserFormDialog
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onOpenChange={onCreateOpenChange}
        onSubmit={onCreateUser}
        title='Crear usuario'
        submitLabel='Crear'
      />
    </>
  );
};

export default UsersTable;
