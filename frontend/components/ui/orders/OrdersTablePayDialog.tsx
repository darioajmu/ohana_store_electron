import { FC } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import PayOrderComponent from '../shared/PayOrderComponent';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { orderRequests } from '../../../requests/order/orderRequests';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../contexts/AppContext';

interface OrdersTablePayDialogProps {
  item: any;
}

const OrdersTablePayDialog: FC<OrdersTablePayDialogProps> = (props: OrdersTablePayDialogProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { setOrders, payWithValue, setTotalValue } = useAppContext();

  const onSubmit = async () => {
    const { payOrder, getOrders } = orderRequests();
    const response = await payOrder(props.item);

    if (response.status === 200) {
      setOrders(await getOrders());
      toast.success('Compra pagada correctamente');
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
      onClose();
    }
  };

  setTotalValue(props.item.total);

  const isDisabled = () => {
    return payWithValue < Number(props.item.total);
  };

  return (
    <div>
      <Button color='primary' onPress={onOpen} className='mr-2'>
        Pagar
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>Pagar compra</ModalHeader>
          <ModalBody>
            <>
              <div>
                <div style={{ position: 'absolute' }}>Total:</div>
                <div style={{ position: 'relative', float: 'inline-end' }}>{currencyFormat(props.item.total)}</div>
              </div>
              <PayOrderComponent showPayWithTikis={false} totalValue={props.item.total} />
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
