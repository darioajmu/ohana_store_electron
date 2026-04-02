'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Selection,
  ChipProps,
} from '@nextui-org/react';
import OrdersTableBottomContent from './OrdersTableBottomContent';
import OrdersTableTopContent from './OrdersTableTopContent';
import { orderRequests } from '../../../requests/order/orderRequests';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import OrdersTableActionsRow from './OrdersTableActionsRow';
import { useAppContext } from '../../../contexts/AppContext';

const statusColorMap: Record<string, ChipProps['color']> = {
  true: 'success',
  false: 'danger',
};

const OrdersTable = () => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const { setOrders, sortDescriptor, setSortDescriptor, items } = useAppContext();

  useEffect(() => {
    const { getOrders } = orderRequests();

    const fetchData = async () => {
      const response = await getOrders();

      setOrders(response);
    };
    fetchData();
  }, [setOrders]);

  const columns = [
    { name: 'Fecha', uid: 'date', sortable: true },
    { name: 'Nombre', uid: 'debtor_name', sortable: true },
    { name: 'Total', uid: 'total', sortable: true },
    { name: 'Estado', uid: 'paid', sortable: true },
    { name: 'Acciones', uid: 'actions' },
  ];

  const statusName = (paid: any) => {
    if (paid) return 'Pagado';

    return 'Pendiente';
  };

  return (
    <Table
      aria-label='Tabla con orden, busqueda y filtro'
      isHeaderSticky
      bottomContentPlacement='outside'
      topContentPlacement='outside'
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
      isStriped
      selectedKeys={selectedKeys}
      sortDescriptor={sortDescriptor}
      bottomContent={<OrdersTableBottomContent />}
      topContent={<OrdersTableTopContent />}
    >
      <TableHeader columns={columns}>
        {(column: any) => (
          <TableColumn key={column.uid} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={'No se han encontrado compras'} items={items}>
        {(item: any) => (
          <TableRow key={item.id}>
            <TableCell>{item.date}</TableCell>
            <TableCell>{item.debtor_name}</TableCell>
            <TableCell>{currencyFormat(item.total)}</TableCell>
            <TableCell>
              <Chip className='capitalize' color={statusColorMap[item.paid]} size='sm' variant='flat'>
                {statusName(item.paid)}
              </Chip>
            </TableCell>
            <TableCell>
              <OrdersTableActionsRow item={item} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;
