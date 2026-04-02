'use client';

import React, { FC } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableCell, TableRow, Input } from '@nextui-org/react';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { TrashIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';

interface CartTableProps {
  onQuantityChange: any;
}

const CartTable: FC<CartTableProps> = (props: CartTableProps) => {
  const { ticketElements, memberValue } = useAppContext();

  const correctProductPrice = (ticketElement: any) => {
    if (memberValue) return ticketElement.price_members;

    return ticketElement.price;
  };

  const rowTotal = (ticketElement: any) => {
    return currencyFormat(ticketElement.quantity * correctProductPrice(ticketElement));
  };

  return (
    <Table aria-label='Carro de Compra' isStriped>
      <TableHeader>
        <TableColumn>Producto</TableColumn>
        <TableColumn>Precio</TableColumn>
        <TableColumn>Cantidad</TableColumn>
        <TableColumn>Total</TableColumn>
        <TableColumn>Borrar</TableColumn>
      </TableHeader>

      <TableBody emptyContent={'No hay nada en el carro'}>
        {ticketElements.map((ticketElement: any) => (
          <TableRow key={ticketElement.name}>
            <TableCell>{ticketElement.name}</TableCell>
            <TableCell>{currencyFormat(correctProductPrice(ticketElement))}</TableCell>
            <TableCell width={'30%'}>
              <Input
                value={ticketElement.quantity}
                type='number'
                step='1'
                min='0'
                variant='underlined'
                onChange={(ev) => props.onQuantityChange(ticketElement.product_id, ev.target.value)}
              />
            </TableCell>
            <TableCell>{rowTotal(ticketElement)}</TableCell>
            <TableCell>{<TrashIcon onClick={() => props.onQuantityChange(ticketElement.product_id, 0)} />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CartTable;
