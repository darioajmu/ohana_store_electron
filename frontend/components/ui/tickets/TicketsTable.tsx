import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table';
import { FC } from 'react';
import currencyFormat from '../../../shared/formats/currencies/currency.format';

interface TicketsTableProps {
  order: any;
}

const TicketsTable: FC<TicketsTableProps> = (props: TicketsTableProps) => {
  const columns = [
    { name: 'Nombre del Producto', uid: 'product_name' },
    { name: 'Cantidad', uid: 'quantity' },
    { name: 'Precio', uid: 'price' },
    { name: 'Total', uid: 'total' },
  ];

  return (
    <Table isStriped>
      <TableHeader columns={columns}>
        {(column: any) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
      </TableHeader>
      <TableBody emptyContent={'No se han encontrado tickets para esta compra'} items={props.order.tickets}>
        {(item: any) => (
          <TableRow key={`${props.order.id}_${item.product_name}`}>
            <TableCell>{item.product_name}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{currencyFormat(item.price)}</TableCell>
            <TableCell>{currencyFormat(item.total)}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TicketsTable;
