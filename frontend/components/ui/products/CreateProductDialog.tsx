'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox } from '@nextui-org/react';
import { Button } from '@nextui-org/button';
import { productRequests } from '../../../requests/product/productRequests';
import { Input } from '@nextui-org/input';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../contexts/AppContext';

const CreateProductDialog = () => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { saveProduct, getProducts } = productRequests();
  const [nameValue, setNameValue] = useState<string>(() => '');
  const [priceValue, setPriceValue] = useState<string>(() => '');
  const [priceMembersValue, setPriceMembersValue] = useState<string>(() => '');
  const [priceTikisValue, setPriceTikisValue] = useState<string>(() => '');
  const [photoValue, setPhoto] = useState<File | null>(null);
  const { setProducts, stockableValue, setStockableValue, onStockableCheckboxChange } = useAppContext();

  const fileTypes = ['JPG', 'JPEG', 'PNG'];

  const newProduct = {
    product: {
      name: nameValue,
      price: priceValue,
      price_members: priceMembersValue,
      price_tikis: priceTikisValue,
      stockable: stockableValue,
      photo: photoValue,
    },
  };

  const onSubmit = async () => {
    const response = await saveProduct(newProduct);

    if (response.status === 201) {
      const response = await getProducts();
      setProducts(response.data);
      setNameValue('');
      setPriceValue('');
      setPriceMembersValue('');
      setPriceTikisValue('');
      setPhoto(null);
      setStockableValue(true);
      toast.success('Producto creado correctamente');
      onClose();
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
      onClose();
    }
  };

  const handleNameChange = (value: string): void => {
    setNameValue(value);
  };

  const handlePriceChange = (value: string): void => {
    setPriceValue(value);
  };

  const handlePriceMembersChange = (value: string): void => {
    setPriceMembersValue(value);
  };

  const handlePhotoChange = (file: any) => {
    const formData = new FormData();
    formData.append('input', file);

    setPhoto(formData.get('input') as File);
  };

  const enabledButton = () => {
    return Boolean(nameValue && priceValue && priceMembersValue && photoValue);
  };

  return (
    <>
      <Button color='primary' onPress={onOpen}>
        Crear Producto
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>Nuevo producto</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label='Nombre del producto'
              variant='bordered'
              isRequired
              value={nameValue}
              onValueChange={handleNameChange}
            />
            <Input
              label='Precio'
              variant='bordered'
              type='number'
              step={0.1}
              min={0}
              isRequired
              endContent={'€'}
              value={priceValue}
              onValueChange={handlePriceChange}
            />
            <Input
              label='Precio para asociados'
              variant='bordered'
              type='number'
              step={0.1}
              min={0}
              isRequired
              endContent={'€'}
              value={priceMembersValue}
              onValueChange={handlePriceMembersChange}
            />
            {/* <Input
              label='Precio en tikis'
              variant='bordered'
              type='number'
              step={1}
              min={0}
              isRequired
              value={priceTikisValue}
              onValueChange={handlePriceTikisChange}
            /> */}
            Foto
            <FileUploader
              handleChange={handlePhotoChange}
              name='file'
              types={fileTypes}
              multiple={false}
              label={'Foto del Producto'}
              value={photoValue}
            />
            <div className={'text-center'}>
              <Checkbox defaultSelected={true} onChange={onStockableCheckboxChange} value={stockableValue}>
                ¿Es un producto de stock?
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onSubmit} isDisabled={!enabledButton()}>
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateProductDialog;
