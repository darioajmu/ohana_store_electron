import { FC } from 'react';
import TicketsTableDialog from '../tickets/TicketsTableDialog';
import OrdersTablePayDialog from './OrdersTablePayDialog';

interface OrdersTableActionsRowProps {
  item: any;
}

const OrdersTableActionsRow: FC<OrdersTableActionsRowProps> = (props: OrdersTableActionsRowProps) => {
  return (
    <div className='inline-flex'>
      <TicketsTableDialog item={props.item} />
      {!props.item.paid ? <OrdersTablePayDialog item={props.item} /> : <></>}
    </div>
  );
};

export default OrdersTableActionsRow;
