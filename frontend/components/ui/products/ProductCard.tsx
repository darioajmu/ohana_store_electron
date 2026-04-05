'use client';

import React, { FC, useState } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import {
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { ProductEntity } from '../../../domain/entities/product/product.entity';
import { productRequests } from '../../../requests/product/productRequests';
import { useAppContext } from '../../../contexts/AppContext';
import { toast } from 'react-toastify';

interface ProductCardsProps {
  onProductPress: (product: any) => void;
  product: ProductEntity;
}

const ProductCard: FC<ProductCardsProps> = (props: ProductCardsProps) => {
  const [priceValue, setPriceValue] = useState(() => String(props.product.price));
  const [priceMembersValue, setPriceMembersValue] = useState(() => String(props.product.price_members));
  const [priceTikisValue, setPriceTikisValue] = useState(() => String(props.product.price_tikis));
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    ticketElements,
    setProducts,
    setTicketElements,
    setMemberValue,
    setTotalValue,
    setPayNow,
    setPayWithValue,
    stockableValue,
    setStockableValue,
    onStockableCheckboxChange,
  } = useAppContext();
  const quantityInCart = ticketElements.find((ticketElement: any) => ticketElement.product_id === props.product.id)?.quantity || 0;
  const isAvailableForSale = props.product.available_for_sale;
  const canAddProduct = !props.product.stockable || quantityInCart < props.product.available_stock;
  const isAddDisabled = !isAvailableForSale || !canAddProduct;

  const handlePriceChange = (value: string): void => {
    setPriceValue(value);
  };

  const handlePriceMembersChange = (value: string): void => {
    setPriceMembersValue(value);
  };

  const handlePriceTikisChange = (value: string): void => {
    setPriceTikisValue(value);
  };

  const editedProduct: any = {
    price: priceValue,
    price_members: priceMembersValue,
    price_tikis: priceTikisValue,
    stockable: stockableValue
  };

  const onSubmit = async () => {
    setTicketElements([]);
    setTotalValue(0);
    setMemberValue(false);
    setPayNow(false);
    setPayWithValue(0);
    setStockableValue(false);
    const { editProduct, getProducts } = productRequests();
    const response = await editProduct(props.product.id, editedProduct);

    if (response.status === 200) {
      const response = await getProducts();
      setProducts(response.data);
      toast.success('Producto editado correctamente');
    } else {
      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
    }
    onClose();
  };

  const enabledButton = () => {
    return Boolean(priceValue && priceMembersValue && priceTikisValue);
  };

  return (
    <>
      <Card shadow='sm' key={props.product.name}>
        <CardBody
          className={`overflow-visible p-0 ${isAddDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          onClick={() => !isAddDisabled && props.onProductPress(props.product)}
        >
          <Image
            shadow='sm'
            radius='lg'
            width='100%'
            alt={props.product.name}
            className='w-full object-cover h-[200px]'
            src={props.product.photo_url}
            isZoomed
          />
        </CardBody>
        <CardFooter className='text-small justify-between'>
          <b>{props.product.name}</b>
        </CardFooter>
        <CardFooter className='text-small justify-between'>
          <p>Precio:</p>
          <p className='text-default-500'>{currencyFormat(props.product.price)}</p>
        </CardFooter>
        <CardFooter className='text-small justify-between'>
          <p>Asociados:</p>
          <p className='text-default-500'>{currencyFormat(props.product.price_members)}</p>
        </CardFooter>
        <CardFooter className='text-small justify-between'>
          <Button
            fullWidth
            className='mx-1 '
            color='primary'
            size='sm'
            isDisabled={isAddDisabled}
            onClick={() => props.onProductPress(props.product)}
          >
            {isAddDisabled ? 'Sin stock' : 'Añadir'}
          </Button>
          <Button fullWidth color='primary' size='sm' onPress={onOpen}>
            Editar
          </Button>

          <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
              <ModalHeader className='flex flex-col gap-1'>{`Editando ${props.product.name}`}</ModalHeader>
              <ModalBody>
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
                <Input
                  label='Precio en tikis'
                  variant='bordered'
                  type='number'
                  step={1}
                  min={0}
                  isRequired
                  value={priceTikisValue}
                  onValueChange={handlePriceTikisChange}
                />
                <div className={'text-center'}>
                  <Checkbox
                    defaultSelected={props.product.stockable}
                    onChange={onStockableCheckboxChange}
                    value={stockableValue}
                  >
                    ¿Es un producto de stock?
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onSubmit} isDisabled={!enabledButton()}>
                  Editar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </CardFooter>
      </Card>
    </>
  );
};
export default ProductCard;
