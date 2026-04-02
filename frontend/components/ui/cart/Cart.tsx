'use client';

import React from 'react';
import CartTable from './CartTable';
import { Button, Card, CardBody, CardHeader, Checkbox, Divider, Input } from '@nextui-org/react';
import { orderRequests } from '../../../requests/order/orderRequests';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import PayOrderComponent from '../shared/PayOrderComponent';
import { CartIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const {
    ticketElements,
    setTicketElements,
    totalValue,
    setTotalValue,
    memberValue,
    setMemberValue,
    debtorName,
    setDebtorName,
    payNow,
    setPayNow,
    payWithValue,
    setPayWithValue,
    calculateTotal,
    payWithTikisValue,
    setPayWithTikisValue,
    calculateRest,
  } = useAppContext();

  const orderBody = {
    order: {
      total: totalValue,
      tickets_attributes: ticketElements,
      debtor_name: debtorName,
      paid: payNow,
      member: memberValue,
    },
  };

  const onMemberCheckboxChange = (value: any): void => {
    setMemberValue(value.target.checked);
    calculateTotal(value.target.checked);
  };

  const onPayingCheckboxChange = (value: any): void => {
    setPayWithValue(0);
    setDebtorName('');
    setPayNow(value.target.checked);
  };

  const onQuantityChange = (id: number, newValue: any) => {
    const ticketElement = ticketElements.find((ticketElement: any) => ticketElement.product_id === id);

    ticketElement.quantity = newValue;

    const noZeroQuantityElements = ticketElements.filter((ticketElement: any) => ticketElement.quantity > 0);

    setPayWithTikisValue(false);

    setTicketElements(noZeroQuantityElements);

    calculateTotal(memberValue);
  };

  const onDebtorNameChange = (value: any) => {
    setDebtorName(value.target.value);
  };

  const createOrder = async () => {
    const { saveOrder } = orderRequests();
    const response = await saveOrder(orderBody);

    if (response.status === 201) {
      setMemberValue(false);
      setPayNow(false);
      setTicketElements([]);
      setPayWithValue(0);
      setDebtorName('');
      setTotalValue(0);
      toast.success('Compra creada correctamente');
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
    }
  };

  const enabledBuyButton = () => {
    return (
      (ticketElements.length && payNow && calculateRest(payWithValue) >= 0) || Boolean(debtorName)
    );
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
        <CartTable onQuantityChange={onQuantityChange} />
        <Divider className='my-4' />
        <div className={'text-center'}>
          <Checkbox
            defaultSelected={false}
            onChange={onMemberCheckboxChange}
            isSelected={memberValue}
            value={memberValue}
            isDisabled={payWithTikisValue}
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
                <Input
                  type='text'
                  onChange={onDebtorNameChange}
                  value={debtorName}
                  disabled={payNow}
                  variant={'underlined'}
                  size='sm'
                />
              </div>
            </div>
          )}
        </>
        <Divider className='my-4' />
        <Button color='primary' onClick={createOrder} isDisabled={!enabledBuyButton()}>
          Crear compra
        </Button>
      </CardBody>
    </Card>
  );
};

export default Cart;
