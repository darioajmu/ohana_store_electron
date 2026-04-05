'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CartTable from './CartTable';
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  useDisclosure,
} from '@nextui-org/react';
import { orderRequests } from '../../../requests/order/orderRequests';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import PayOrderComponent from '../shared/PayOrderComponent';
import { CartIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';
import { toast } from 'react-toastify';
import { userRequests } from '../../../requests/user/userRequests';
import { UserEntity } from '../../../domain/entities/user/user.entity';
import UserFormDialog from '../users/UserFormDialog';

const Cart = () => {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userAutocompleteValue, setUserAutocompleteValue] = useState('');
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  const [priceErrors, setPriceErrors] = useState<Record<number, string>>({});
  const [quantityDrafts, setQuantityDrafts] = useState<Record<number, string>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    ticketElements,
    setTicketElements,
    totalValue,
    setTotalValue,
    memberValue,
    setMemberValue,
    payNow,
    setPayNow,
    payWithValue,
    setPayWithValue,
    getTotalValue,
    payWithTikisValue,
    setPayWithTikisValue,
    calculateRest,
  } = useAppContext();

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );
  const selectedUserMember = selectedUser?.member ?? false;
  const shouldSearchUsers = userAutocompleteValue.trim().length >= 3;

  const orderBody = {
    order: {
      total: totalValue,
      tickets_attributes: ticketElements,
      user_id: selectedUserId,
      paid: payNow,
      member: memberValue,
    },
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!shouldSearchUsers) {
        setUsers([]);
        return;
      }

      const { searchUsers } = userRequests();
      const response = await searchUsers(userAutocompleteValue.trim());

      if (response.status === 200) {
        setUsers(response.data);
      }
    };

    fetchUsers();
  }, [shouldSearchUsers, userAutocompleteValue]);

  useEffect(() => {
    if (payNow) return;
    if (!selectedUserId) return;

    const nextMemberValue = selectedUserMember;
    const updatedTicketElements = ticketElements.map((ticketElement: any) => ({
      ...ticketElement,
      price: Number(nextMemberValue ? ticketElement.price_members : ticketElement.base_price ?? ticketElement.price),
    }));

    setMemberValue(nextMemberValue);
    setTicketElements(updatedTicketElements);
    setPriceDrafts({});
    setPriceErrors({});
    setTotalValue(
      updatedTicketElements.reduce(
        (total: number, ticketElement: any) => total + Number(ticketElement.price) * ticketElement.quantity,
        0
      )
    );
  }, [selectedUserId, selectedUserMember, payNow]);

  const resetCartPricesToDefault = (membership: boolean) => {
    const updatedTicketElements = ticketElements.map((ticketElement: any) => ({
      ...ticketElement,
      price: Number(membership ? ticketElement.price_members : ticketElement.base_price ?? ticketElement.price),
    }));

    setTicketElements(updatedTicketElements);
    setPriceDrafts({});
    setPriceErrors({});
    setTotalValue(getTotalValue(updatedTicketElements, membership));
  };

  const onMemberCheckboxChange = (value: any): void => {
    const nextMemberValue = value.target.checked;
    setMemberValue(nextMemberValue);
    resetCartPricesToDefault(nextMemberValue);
  };

  const onPayingCheckboxChange = (value: any): void => {
    setPayWithValue(0);
    setSelectedUserId(null);
    setUserAutocompleteValue('');
    setPayNow(value.target.checked);
  };

  const normalizePriceInput = (value: string) => value.replace(',', '.');
  const isValidHalfStepPrice = (value: string) => {
    if (!/^\d*([.,]\d{0,2})?$/.test(value)) return false;

    const normalizedValue = Number(normalizePriceInput(value));
    if (Number.isNaN(normalizedValue) || normalizedValue < 0) return false;

    return Number.isInteger(normalizedValue * 2);
  };

  const onPriceChange = (id: number, newValue: any) => {
    const rawValue = String(newValue ?? '');

    if (rawValue === '') {
      setPriceDrafts((currentDrafts) => ({
        ...currentDrafts,
        [id]: '',
      }));
      setPriceErrors((currentErrors) => ({
        ...currentErrors,
        [id]: 'Introduce un precio valido',
      }));
      return;
    }

    if (!/^\d*([.,]\d{0,2})?$/.test(rawValue)) return;

    const nextPrice = Number(normalizePriceInput(rawValue));

    if (!isValidHalfStepPrice(rawValue)) {
      setPriceDrafts((currentDrafts) => ({
        ...currentDrafts,
        [id]: rawValue,
      }));
      setPriceErrors((currentErrors) => ({
        ...currentErrors,
        [id]: 'Introduce un precio valido en pasos de 0,5',
      }));
      return;
    }

    const updatedTicketElements = ticketElements.map((ticketElement: any) =>
      ticketElement.product_id === id ? { ...ticketElement, price: nextPrice } : ticketElement
    );

    setPriceDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[id];
      return nextDrafts;
    });
    setPriceErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[id];
      return nextErrors;
    });
    setTicketElements(updatedTicketElements);
    setTotalValue(getTotalValue(updatedTicketElements, memberValue));
  };

  const onQuantityChange = (id: number, newValue: any) => {
    const rawValue = String(newValue ?? '');
    const isEmptyValue = rawValue === '';
    const ticketElement = ticketElements.find((currentTicketElement: any) => currentTicketElement.product_id === id);

    if (isEmptyValue) {
      setQuantityDrafts((currentDrafts) => ({
        ...currentDrafts,
        [id]: '',
      }));
      setQuantityErrors((currentErrors) => ({
        ...currentErrors,
        [id]: 'Introduce una cantidad entera valida',
      }));
      return;
    }

    if (!/^\d+$/.test(rawValue)) return;

    const nextQuantity = Number.parseInt(rawValue, 10);

    if (ticketElement?.stockable && nextQuantity > ticketElement.available_stock) {
      setQuantityErrors((currentErrors) => ({
        ...currentErrors,
        [id]: `Stock maximo disponible: ${ticketElement.available_stock}`,
      }));
      return;
    }

    const updatedTicketElements = ticketElements
      .map((ticketElement: any) =>
        ticketElement.product_id === id ? { ...ticketElement, quantity: nextQuantity } : ticketElement
      )
      .filter((ticketElement: any) => ticketElement.quantity > 0);

    setQuantityErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[id];
      return nextErrors;
    });
    setQuantityDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[id];
      return nextDrafts;
    });
    setPayWithTikisValue(false);
    setTicketElements(updatedTicketElements);
    setTotalValue(getTotalValue(updatedTicketElements, memberValue));
  };

  const onUserSelectionChange = (value: any) => {
    const nextUserId = value ? Number(value) : null;
    const nextUser = users.find((user) => user.id === nextUserId) ?? null;

    setSelectedUserId(nextUserId);
    setUserAutocompleteValue(nextUser?.name ?? '');
  };

  const onUserInputChange = (value: string) => {
    setUserAutocompleteValue(value);

    if (selectedUser && selectedUser.name !== value) {
      setSelectedUserId(null);
    }
  };

  const openCreateUserModal = () => {
    onOpen();
  };

  const onCreateUser = async (user: { name: string; member: boolean }) => {
    if (!user.name) {
      toast.error('Introduce un nombre para crear el usuario');
      return;
    }

    try {
      const { saveUser } = userRequests();
      const response = await saveUser({
        user: {
          name: user.name,
          member: user.member,
        },
      });

      if (response.status === 201) {
        const createdUser = response.data;

        setUsers([createdUser]);
        setSelectedUserId(createdUser?.id ?? null);
        setUserAutocompleteValue(createdUser?.name ?? user.name);
        onClose();
        toast.success('Usuario creado correctamente');
      }
    } catch (_error) {
      toast.error('No se ha podido crear el usuario');
    }
  };

  const createOrder = async () => {
    if (Object.keys(quantityErrors).length > 0 || Object.keys(priceErrors).length > 0) {
      toast.error('Corrige las lineas invalidas antes de guardar');
      return;
    }

    try {
      const { saveOrder } = orderRequests();
      const response = await saveOrder(orderBody);

      if (response.status === 201) {
        setMemberValue(false);
        setPayNow(false);
        setTicketElements([]);
        setPriceDrafts({});
        setPriceErrors({});
        setQuantityDrafts({});
        setQuantityErrors({});
        setPayWithValue(0);
        setSelectedUserId(null);
        setUserAutocompleteValue('');
        setTotalValue(0);
        toast.success('Compra creada correctamente');
      } else {
        toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
      }
    } catch (error: any) {
      const baseErrors = error?.response?.data?.base;
      const stockError = Array.isArray(baseErrors)
        ? baseErrors.find(
            (message: string) =>
              message.includes('Insufficient stock') || message.includes('No stock entry found')
          )
        : undefined;

      if (stockError) {
        toast.error('No se ha podido crear la venta porque no hay stock suficiente de ese producto');
        return;
      }

      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
    }
  };

  const enabledBuyButton = () => {
    if (Object.keys(quantityErrors).length > 0) return false;
    if (Object.keys(priceErrors).length > 0) return false;
    if (!ticketElements.length) return false;

    return (payNow && calculateRest(payWithValue) >= 0) || Boolean(selectedUserId);
  };

  return (
    <Card>
      <CardHeader className='justify-center' style={{ backgroundColor: '#B87333' }}>
        <div>
          <CartIcon />
        </div>
        <div>Carro</div>
      </CardHeader>
      <CardBody>
        <CartTable
          onPriceChange={onPriceChange}
          onQuantityChange={onQuantityChange}
          priceDrafts={priceDrafts}
          priceErrors={priceErrors}
          quantityDrafts={quantityDrafts}
          quantityErrors={quantityErrors}
        />
        <Divider className='my-4' />
        <div className={'text-center'}>
          <Checkbox
            defaultSelected={false}
            onChange={onMemberCheckboxChange}
            isSelected={memberValue}
            value={memberValue}
            isDisabled={payWithTikisValue || (!payNow && Boolean(selectedUserId))}
          >
            <p>¿Venta a Asociado?</p>
          </Checkbox>
        </div>
        <Divider className='my-4' />
        <p className={'text-right'}>Total: {currencyFormat(totalValue)}</p>
        <Divider className='my-4' />

        <div className={'text-center'}>
          <Checkbox defaultSelected={false} onChange={onPayingCheckboxChange} isSelected={payNow} value={payNow}>
            ¿Paga ahora?
          </Checkbox>
        </div>
        <>
          {payNow ? (
            <>
              <PayOrderComponent showPayWithTikis={true} totalValue={totalValue} />
            </>
          ) : (
            <div>
              <p className='pt-3 pb-3' style={{ float: 'left' }}>
                Apuntar a:
              </p>
              <div style={{ width: '50%', float: 'right' }}>
                <Autocomplete
                  inputValue={userAutocompleteValue}
                  defaultItems={shouldSearchUsers ? users : []}
                  emptyContent={shouldSearchUsers ? 'No se han encontrado usuarios' : 'Escribe al menos 3 letras'}
                  selectedKey={selectedUserId ? String(selectedUserId) : null}
                  onInputChange={onUserInputChange}
                  onSelectionChange={onUserSelectionChange}
                  isDisabled={payNow}
                  variant={'underlined'}
                  size='sm'
                  placeholder='Selecciona un usuario...'
                >
                  {(user: UserEntity) => <AutocompleteItem key={user.id}>{user.name}</AutocompleteItem>}
                </Autocomplete>
                <Button className='mt-2' size='sm' variant='light' onPress={openCreateUserModal}>
                  Crear usuario
                </Button>
              </div>
            </div>
          )}
        </>
        <Divider className='my-4' />
        <Button color='primary' onClick={createOrder} isDisabled={!enabledBuyButton()}>
          Crear compra
        </Button>
        <UserFormDialog
          isOpen={isOpen}
          onClose={onClose}
          onOpenChange={onOpenChange}
          onSubmit={onCreateUser}
          title='Crear usuario'
          submitLabel='Crear'
        />
      </CardBody>
    </Card>
  );
};

export default Cart;
