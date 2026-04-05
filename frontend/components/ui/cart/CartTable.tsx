'use client';

import React, { FC } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableCell, TableRow, Input } from '@nextui-org/react';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { TrashIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';

interface CartTableProps {
  onPriceChange: any;
  onQuantityChange: any;
  priceDrafts: Record<number, string>;
  priceErrors: Record<number, string>;
  quantityDrafts: Record<number, string>;
  quantityErrors: Record<number, string>;
}

const CartTable: FC<CartTableProps> = (props: CartTableProps) => {
  const { ticketElements } = useAppContext();

  const onQuantityBeforeInput = (event: any) => {
    if (event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  };

  const onQuantityPaste = (event: any) => {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (/\D/.test(pastedText)) {
      event.preventDefault();
    }
  };

  const onQuantityKeyDown = (event: any) => {
    if ([' ', '.', ',', '-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const disableNumberScroll = (event: any) => {
    event.currentTarget.blur();
    event.stopPropagation();
  };

  const onPriceBeforeInput = (event: any) => {
    if (event.data && /[^\d.,]/.test(event.data)) {
      event.preventDefault();
    }
  };

  const onPricePaste = (event: any) => {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (/[^\d.,]/.test(pastedText)) {
      event.preventDefault();
    }
  };

  const rowTotal = (ticketElement: any) => {
    return currencyFormat(ticketElement.quantity * Number(ticketElement.price));
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
            <TableCell width={'22%'}>
              <Input
                value={props.priceDrafts[ticketElement.product_id] ?? String(ticketElement.price)}
                type='number'
                step='0.5'
                min='0'
                variant='underlined'
                isInvalid={Boolean(props.priceErrors[ticketElement.product_id])}
                errorMessage={props.priceErrors[ticketElement.product_id]}
                onBeforeInput={onPriceBeforeInput}
                onWheel={disableNumberScroll}
                onPaste={onPricePaste}
                onChange={(ev) => props.onPriceChange(ticketElement.product_id, ev.target.value)}
              />
            </TableCell>
            <TableCell width={'20%'}>
              <Input
                value={props.quantityDrafts[ticketElement.product_id] ?? String(ticketElement.quantity)}
                type='number'
                step='1'
                min='0'
                max={ticketElement.stockable ? String(ticketElement.available_stock) : undefined}
                variant='underlined'
                isInvalid={Boolean(props.quantityErrors[ticketElement.product_id])}
                errorMessage={props.quantityErrors[ticketElement.product_id]}
                onBeforeInput={onQuantityBeforeInput}
                onKeyDown={onQuantityKeyDown}
                onWheel={disableNumberScroll}
                onPaste={onQuantityPaste}
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
