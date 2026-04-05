import { FC, useEffect } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import PayOrderComponent from '../shared/PayOrderComponent';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { orderRequests } from '../../../requests/order/orderRequests';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../contexts/AppContext';

interface OrdersTablePayDialogProps {
  buttonLabel?: string;
  items: any[];
  onPaidSuccess?: () => void;
}

const OrdersTablePayDialog: FC<OrdersTablePayDialogProps> = (props: OrdersTablePayDialogProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { setOrders, payWithValue, setTotalValue, setPayWithValue, statusFilter } = useAppContext();
  const totalAmount = props.items.reduce((total: number, item: any) => total + Number(item.total), 0);

  useEffect(() => {
    if (isOpen) {
      setTotalValue(totalAmount);
      setPayWithValue(0);
    }
  }, [isOpen, totalAmount, setPayWithValue, setTotalValue]);

  const onSubmit = async () => {
    const { payOrder, getOrders, getPaidOrders, getNotPaidOrders } = orderRequests();
    const responses = await Promise.all(props.items.map((item: any) => payOrder(item)));
    const hasError = responses.some((response) => response.status !== 200);

    if (!hasError) {
      if (statusFilter === 'true') {
        setOrders(await getPaidOrders());
      } else if (statusFilter === 'false') {
        setOrders(await getNotPaidOrders());
      } else {
        setOrders(await getOrders());
      }
      props.onPaidSuccess?.();
      onClose();
      toast.success(props.items.length > 1 ? 'Compras pagadas correctamente' : 'Compra pagada correctamente');
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
      onClose();
    }
  };

  const isDisabled = () => {
    return payWithValue < totalAmount;
  };

  return (
    <div>
      <Button color='primary' onPress={onOpen} className='mr-2'>
        {props.buttonLabel || 'Pagar'}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            {props.items.length > 1 ? 'Pagar compras' : 'Pagar compra'}
          </ModalHeader>
          <ModalBody>
            <>
              <div>
                <div style={{ position: 'absolute' }}>Total:</div>
                <div style={{ position: 'relative', float: 'inline-end' }}>{currencyFormat(totalAmount)}</div>
              </div>
              <PayOrderComponent showPayWithTikis={false} totalValue={totalAmount} />
            </>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onSubmit} isDisabled={isDisabled()}>
              Pagar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default OrdersTablePayDialog;
