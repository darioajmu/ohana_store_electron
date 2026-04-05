'use client';

import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC, useEffect, useState } from 'react';

interface UserFormDialogProps {
  initialMember?: boolean;
  initialName?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: () => void;
  onSubmit: (user: { name: string; member: boolean }) => Promise<void> | void;
  submitLabel: string;
  title: string;
}

const UserFormDialog: FC<UserFormDialogProps> = ({
  initialMember = false,
  initialName = '',
  isOpen,
  onClose,
  onOpenChange,
  onSubmit,
  submitLabel,
  title,
}) => {
  const [name, setName] = useState(initialName);
  const [member, setMember] = useState(initialMember);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setMember(initialMember);
    }
  }, [initialMember, initialName, isOpen]);

  const handleSubmit = async () => {
    await onSubmit({
      name: name.trim(),
      member,
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
        <ModalBody>
          <Input label='Nombre' value={name} onValueChange={setName} variant='underlined' />
          <Checkbox isSelected={member} onChange={(event) => setMember(event.target.checked)}>
            ¿Es asociado?
          </Checkbox>
        </ModalBody>
        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            Cancelar
          </Button>
          <Button color='primary' onPress={handleSubmit}>
            {submitLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserFormDialog;
