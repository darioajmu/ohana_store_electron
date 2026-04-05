import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
import { FC } from 'react';
import EditPendingOrderTickets from './EditPendingOrderTickets';

interface TicketsTableDialogProps {
  item: any;
}

const TicketsTableDialog: FC<TicketsTableDialogProps> = (props: TicketsTableDialogProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  return (
    <>
      <Button color='primary' onPress={onOpen} className='mr-2'>
        Ver Tickets
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='5xl'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>{props.item.paid ? 'Tickets' : 'Editar compra'}</ModalHeader>
          <ModalBody>
            <EditPendingOrderTickets
              order={props.item}
              readOnly={props.item.paid}
              onCancel={onClose}
              onOrderUpdated={() => {
                onClose();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TicketsTableDialog;
