import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
import { FC } from 'react';
import TicketsTable from './TicketsTable';

interface TicketsTableDialogProps {
  item: any;
}

const TicketsTableDialog: FC<TicketsTableDialogProps> = (props: TicketsTableDialogProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button color='primary' onPress={onOpen} className='mr-2'>
        Ver Tickets
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='5xl'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>Tickets</ModalHeader>
          <ModalBody>
            <TicketsTable order={props.item} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TicketsTableDialog;
