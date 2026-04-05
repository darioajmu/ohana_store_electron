import { FC } from 'react';
import TicketsTableDialog from '../tickets/TicketsTableDialog';
import OrdersTablePayDialog from './OrdersTablePayDialog';

interface OrdersTableActionsRowProps {
  item: any;
  onPaidSuccess?: () => void;
}

const OrdersTableActionsRow: FC<OrdersTableActionsRowProps> = (props: OrdersTableActionsRowProps) => {
  return (
    <div className='inline-flex'>
      <TicketsTableDialog item={props.item} />
      {!props.item.paid ? <OrdersTablePayDialog items={[props.item]} onPaidSuccess={props.onPaidSuccess} /> : <></>}
    </div>
  );
};

export default OrdersTableActionsRow;
