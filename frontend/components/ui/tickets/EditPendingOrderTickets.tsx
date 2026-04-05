'use client';

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../../contexts/AppContext';
import { productRequests } from '../../../requests/product/productRequests';
import { orderRequests } from '../../../requests/order/orderRequests';
import currencyFormat from '../../../shared/formats/currencies/currency.format';
import { TrashIcon } from '../../icons';

interface EditPendingOrderTicketsProps {
  onCancel: () => void;
  onOrderUpdated: (order: any) => void;
  order: any;
  readOnly?: boolean;
}

interface EditableTicket {
  available_stock: number;
  isNewRow?: boolean;
  name: string;
  price: number;
  product_id: number;
  quantity: number;
  stockable: boolean;
}

const EditPendingOrderTickets: FC<EditPendingOrderTicketsProps> = (props: EditPendingOrderTicketsProps) => {
  const [editableTickets, setEditableTickets] = useState<EditableTicket[]>([]);
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  const [priceErrors, setPriceErrors] = useState<Record<number, string>>({});
  const [quantityDrafts, setQuantityDrafts] = useState<Record<number, string>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductPriceError, setNewProductPriceError] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('1');
  const [newProductQuantityError, setNewProductQuantityError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const newProductInputRef = useRef<HTMLInputElement | null>(null);
  const { setOrders, statusFilter } = useAppContext();

  useEffect(() => {
    setEditableTickets(
      props.order.tickets.map((ticket: any) => ({
        available_stock: Number(ticket.available_stock ?? 0),
        name: ticket.product_name,
        price: Number(ticket.price),
        product_id: Number(ticket.product_id),
        quantity: Number(ticket.quantity),
        stockable: Boolean(ticket.stockable),
      }))
    );
    setPriceDrafts({});
    setPriceErrors({});
    setQuantityDrafts({});
    setQuantityErrors({});
    setIsAddingProduct(false);
    setProductSearchValue('');
    setSelectedProductId(null);
    setNewProductPrice('');
    setNewProductPriceError('');
    setNewProductQuantity('1');
    setNewProductQuantityError('');
  }, [props.order]);

  useEffect(() => {
    if (!isAddingProduct) return;

    const timeoutId = window.setTimeout(() => {
      newProductInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAddingProduct]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { getProducts } = productRequests();
      const response = await getProducts();

      if (response.status === 200) {
        setProducts(response.data);
      }
    };

    fetchProducts();
  }, []);

  const availableProducts = useMemo(() => {
    return products.filter((product) => product.available_for_sale || editableTickets.some((ticket) => ticket.product_id === product.id));
  }, [editableTickets, products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearchValue.trim().toLowerCase();

    if (normalizedSearch.length < 3) return [];

    return availableProducts.filter((product) => product.name.toLowerCase().includes(normalizedSearch));
  }, [availableProducts, productSearchValue]);

  const shouldShowProductSuggestions = !selectedProductId && productSearchValue.trim().length >= 3;

  const onQuantityBeforeInput = (event: any) => {
    if (event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  };

  const onQuantityPaste = (event: any) => {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (/\D/.test(pastedText)) {
      event.preventDefault();
    }
  };

  const onPriceBeforeInput = (event: any) => {
    if (event.data && /[^\d.,]/.test(event.data)) {
      event.preventDefault();
    }
  };

  const onPricePaste = (event: any) => {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (/[^\d.,]/.test(pastedText)) {
      event.preventDefault();
    }
  };

  const normalizePriceInput = (value: string) => value.replace(',', '.');

  const isValidPositivePrice = (value: string) => {
    if (!/^\d+([.,]\d{0,2})?$/.test(value)) return false;

    const normalizedValue = Number(normalizePriceInput(value));

    if (Number.isNaN(normalizedValue) || normalizedValue < 0) return false;

    return Number.isInteger(normalizedValue * 2);
  };

  const onQuantityKeyDown = (event: any) => {
    event.stopPropagation();

    if ([' ', '.', ',', '-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const stopTableKeyboardNavigation = (event: any) => {
    event.stopPropagation();
  };

  const disableNumberScroll = (event: any) => {
    event.currentTarget.blur();
    event.stopPropagation();
  };

  const refreshOrders = async () => {
    const { getOrders, getPaidOrders, getNotPaidOrders } = orderRequests();

    if (statusFilter === 'true') {
      setOrders(await getPaidOrders());
    } else if (statusFilter === 'false') {
      setOrders(await getNotPaidOrders());
    } else {
      setOrders(await getOrders());
    }
  };

  const onQuantityChange = (productId: number, newValue: any) => {
    const rawValue = String(newValue ?? '');
    const ticket = editableTickets.find((currentTicket) => currentTicket.product_id === productId);

    if (!ticket) return;

    if (rawValue === '') {
      setQuantityDrafts((currentDrafts) => ({ ...currentDrafts, [productId]: '' }));
      setQuantityErrors((currentErrors) => ({
        ...currentErrors,
        [productId]: 'Introduce una cantidad entera valida',
      }));
      return;
    }

    if (!/^\d+$/.test(rawValue)) return;

    const nextQuantity = Number.parseInt(rawValue, 10);

    if (ticket.stockable && nextQuantity > ticket.available_stock) {
      setQuantityErrors((currentErrors) => ({
        ...currentErrors,
        [productId]: `Stock maximo disponible: ${ticket.available_stock}`,
      }));
      return;
    }

    if (nextQuantity === 0) {
      onRemoveTicket(productId);
      return;
    }

    setEditableTickets((currentTickets) =>
      currentTickets.map((currentTicket) =>
        currentTicket.product_id === productId ? { ...currentTicket, quantity: nextQuantity } : currentTicket
      )
    );
    setQuantityDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[productId];
      return nextDrafts;
    });
    setQuantityErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[productId];
      return nextErrors;
    });
  };

  const onRemoveTicket = (productId: number) => {
    setEditableTickets((currentTickets) => currentTickets.filter((ticket) => ticket.product_id !== productId));
    setPriceDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[productId];
      return nextDrafts;
    });
    setPriceErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[productId];
      return nextErrors;
    });
    setQuantityDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[productId];
      return nextDrafts;
    });
    setQuantityErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[productId];
      return nextErrors;
    });
  };

  const resetNewProductRow = () => {
    setIsAddingProduct(false);
    setSelectedProductId(null);
    setProductSearchValue('');
    setNewProductPrice('');
    setNewProductPriceError('');
    setNewProductQuantity('1');
    setNewProductQuantityError('');
  };

  const pendingNewTicket = useMemo(() => {
    if (!selectedProductId) return null;

    const selectedProduct = products.find((product) => product.id === selectedProductId);
    if (!selectedProduct) return null;

    return {
      available_stock: Number(selectedProduct.available_stock ?? 0),
      name: selectedProduct.name,
      price: isValidPositivePrice(newProductPrice)
        ? Number(normalizePriceInput(newProductPrice))
        : Number(props.order.user_member ? selectedProduct.price_members : selectedProduct.price),
      product_id: Number(selectedProduct.id),
      quantity: /^\d+$/.test(newProductQuantity) ? Number.parseInt(newProductQuantity, 10) : 0,
      stockable: Boolean(selectedProduct.stockable),
    };
  }, [newProductPrice, newProductQuantity, products, props.order.user_member, selectedProductId]);

  const maxNewProductQuantity = useMemo(() => {
    if (!selectedProductId) return null;

    const existingTicket = editableTickets.find((ticket) => ticket.product_id === selectedProductId);
    if (existingTicket) {
      return existingTicket.available_stock - existingTicket.quantity;
    }

    const selectedProduct = products.find((product) => product.id === selectedProductId);
    if (!selectedProduct?.stockable) return null;

    return Number(selectedProduct.available_stock ?? 0);
  }, [editableTickets, products, selectedProductId]);

  useEffect(() => {
    if (!selectedProductId) {
      setNewProductQuantityError('');
      return;
    }

    if (newProductQuantity === '' || !/^\d+$/.test(newProductQuantity) || Number.parseInt(newProductQuantity, 10) <= 0) {
      setNewProductQuantityError('Introduce una cantidad entera valida');
      return;
    }

    if (maxNewProductQuantity !== null && Number.parseInt(newProductQuantity, 10) > maxNewProductQuantity) {
      setNewProductQuantityError(`Stock maximo disponible: ${maxNewProductQuantity}`);
      return;
    }

    setNewProductQuantityError('');
  }, [maxNewProductQuantity, newProductQuantity, selectedProductId]);

  useEffect(() => {
    if (!selectedProductId) {
      setNewProductPriceError('');
      return;
    }

    if (newProductPrice === '') {
      const selectedProduct = products.find((product) => product.id === selectedProductId);
      if (selectedProduct) {
        setNewProductPrice(String(props.order.user_member ? selectedProduct.price_members : selectedProduct.price));
      }
      return;
    }

    if (!isValidPositivePrice(newProductPrice)) {
      setNewProductPriceError('Introduce un precio valido en pasos de 0,5');
      return;
    }

    setNewProductPriceError('');
  }, [newProductPrice, products, props.order.user_member, selectedProductId]);

  const orderTotal = useMemo(() => {
    const ticketsTotal = editableTickets.reduce(
      (total: number, ticket: EditableTicket) => total + ticket.quantity * ticket.price,
      0
    );

    if (!pendingNewTicket || pendingNewTicket.quantity <= 0) {
      return ticketsTotal;
    }

    const existingTicket = editableTickets.find((ticket) => ticket.product_id === pendingNewTicket.product_id);

    if (existingTicket) {
      return ticketsTotal + pendingNewTicket.quantity * existingTicket.price;
    }

    return ticketsTotal + pendingNewTicket.quantity * pendingNewTicket.price;
  }, [editableTickets, pendingNewTicket]);

  const tableRows = useMemo(
    () => [
      ...editableTickets,
      ...(props.readOnly
        ? []
        : [
            {
              available_stock: 0,
              isNewRow: true,
              name: productSearchValue,
              price: isValidPositivePrice(newProductPrice) ? Number(normalizePriceInput(newProductPrice)) : 0,
              product_id: selectedProductId ?? -1,
              quantity: /^\d+$/.test(newProductQuantity) ? Number.parseInt(newProductQuantity, 10) : 0,
              stockable: false,
            },
          ]),
    ],
    [editableTickets, isAddingProduct, newProductPrice, newProductQuantity, productSearchValue, props.readOnly, selectedProductId]
  );

  const onSave = async () => {
    if (props.readOnly) {
      props.onCancel();
      return;
    }

    if (Object.keys(quantityErrors).length > 0 || Object.keys(priceErrors).length > 0) {
      toast.error('Corrige las lineas invalidas antes de guardar');
      return;
    }

    if ((selectedProductId || productSearchValue.trim()) && !pendingNewTicket) {
      toast.error('Completa el nuevo producto antes de guardar o cancelalo');
      return;
    }

    if (pendingNewTicket && pendingNewTicket.quantity <= 0) {
      setNewProductQuantityError('Introduce una cantidad entera valida');
      toast.error('Corrige la cantidad del nuevo producto antes de guardar');
      return;
    }

    if (newProductQuantityError || newProductPriceError) {
      toast.error('Corrige la linea nueva antes de guardar');
      return;
    }

    if (!editableTickets.length && !pendingNewTicket) {
      toast.error('La compra debe tener al menos un ticket');
      return;
    }

    const ticketsToSave = [...editableTickets];

    if (pendingNewTicket) {
      const existingTicket = ticketsToSave.find((ticket) => ticket.product_id === pendingNewTicket.product_id);

      if (existingTicket) {
        if (
          existingTicket.stockable &&
          existingTicket.quantity + pendingNewTicket.quantity > existingTicket.available_stock
        ) {
          toast.error('No puedes anadir mas unidades porque no hay stock suficiente');
          return;
        }

        existingTicket.quantity += pendingNewTicket.quantity;
      } else {
        if (pendingNewTicket.stockable && pendingNewTicket.quantity > pendingNewTicket.available_stock) {
          toast.error('No puedes anadir mas unidades porque no hay stock suficiente');
          return;
        }

        ticketsToSave.push(pendingNewTicket);
      }
    }

    setIsSaving(true);

    try {
      const { updatePendingItems } = orderRequests();
      const response = await updatePendingItems(props.order.id, {
        order: {
          tickets_attributes: ticketsToSave.map((ticket) => ({
            product_id: ticket.product_id,
            price: ticket.price,
            quantity: ticket.quantity,
          })),
        },
      });

      if (response.status === 200) {
        await refreshOrders();
        props.onOrderUpdated(response.data);
        toast.success('Compra actualizada correctamente');
        return;
      }

      toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
    } catch (error: any) {
      const baseErrors = error?.response?.data?.base;
      const stockError = Array.isArray(baseErrors)
        ? baseErrors.find(
            (message: string) =>
              message.includes('Insufficient stock') || message.includes('No stock entry found')
          )
        : undefined;

      if (stockError) {
        toast.error('No se ha podido guardar porque no hay stock suficiente de ese producto');
      } else {
        toast.error('Algo ha ido mal. Vuelve a probar en unos minutos');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 overflow-visible'>
      <Table
        aria-label='Editar tickets'
        isStriped
        classNames={{
          base: 'overflow-visible',
          wrapper: 'overflow-visible',
        }}
      >
        <TableHeader>
          <TableColumn>Producto</TableColumn>
          <TableColumn>Precio</TableColumn>
          <TableColumn>Cantidad</TableColumn>
          <TableColumn>Total</TableColumn>
          <TableColumn>Borrar</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'No hay tickets en esta compra'} items={tableRows}>
          {(ticket: EditableTicket) =>
            ticket.isNewRow ? (
              <TableRow key={`${props.order.id}_new-ticket`}>
                <TableCell>
                  {isAddingProduct || productSearchValue || selectedProductId ? (
                    <div className='relative z-50 max-w-md'>
                      <Input
                        ref={newProductInputRef}
                        isClearable
                        placeholder='Escribe al menos 3 letras'
                        value={productSearchValue}
                        variant='underlined'
                        isReadOnly={props.readOnly}
                        onClear={() => {
                          setProductSearchValue('');
                          setSelectedProductId(null);
                          setNewProductPrice('');
                          setNewProductPriceError('');
                        }}
                        onClick={stopTableKeyboardNavigation}
                        onChange={(ev) => {
                          setProductSearchValue(ev.target.value);
                          if (selectedProductId) {
                            setSelectedProductId(null);
                          }
                        }}
                        onFocus={stopTableKeyboardNavigation}
                        onKeyDown={stopTableKeyboardNavigation}
                      />
                      {shouldShowProductSuggestions ? (
                        <div className='absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-medium border border-default-200 bg-content1 shadow-medium'>
                          {filteredProducts.length ? (
                            filteredProducts.map((product: any) => (
                              <button
                                key={product.id}
                                className='block w-full px-3 py-2 text-left text-sm hover:bg-default-100'
                                onClick={() => {
                                  setSelectedProductId(Number(product.id));
                                  setProductSearchValue(product.name);
                                  setNewProductPrice(String(props.order.user_member ? product.price_members : product.price));
                                  setNewProductPriceError('');
                                }}
                                type='button'
                              >
                                {product.name}
                              </button>
                            ))
                          ) : (
                            <div className='px-3 py-2 text-sm text-default-400'>No se han encontrado productos</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      className='text-left text-default-400 hover:text-foreground transition-colors'
                      onClick={() => {
                        setIsAddingProduct(true);
                      }}
                      type='button'
                    >
                      Añadir producto...
                    </button>
                  )}
                </TableCell>
                <TableCell width={'22%'}>
                  {selectedProductId ? (
                    <Input
                      value={newProductPrice}
                      type='number'
                      step='0.5'
                      min='0'
                      variant='underlined'
                      isReadOnly={props.readOnly}
                      isInvalid={Boolean(newProductPriceError)}
                      errorMessage={newProductPriceError}
                      onBeforeInput={onPriceBeforeInput}
                      onClick={stopTableKeyboardNavigation}
                      onFocus={stopTableKeyboardNavigation}
                      onKeyDown={stopTableKeyboardNavigation}
                      onWheel={disableNumberScroll}
                      onPaste={onPricePaste}
                      onChange={(ev) => {
                        const nextValue = ev.target.value;

                        if (!/^\d*([.,]\d{0,2})?$/.test(nextValue) && nextValue !== '') return;

                        setNewProductPrice(nextValue);
                      }}
                    />
                  ) : (
                    ''
                  )}
                </TableCell>
                <TableCell width={'20%'}>
                  <Input
                    value={newProductQuantity}
                    type='number'
                    step='1'
                    min='1'
                    max={maxNewProductQuantity !== null ? String(maxNewProductQuantity) : undefined}
                    variant='underlined'
                    isReadOnly={props.readOnly}
                    isDisabled={!selectedProductId}
                    isInvalid={Boolean(newProductQuantityError)}
                    errorMessage={newProductQuantityError}
                    onBeforeInput={onQuantityBeforeInput}
                    onClick={stopTableKeyboardNavigation}
                    onFocus={stopTableKeyboardNavigation}
                    onKeyDown={onQuantityKeyDown}
                    onWheel={disableNumberScroll}
                    onPaste={onQuantityPaste}
                    onChange={(ev) => {
                      const nextValue = ev.target.value;
                      setNewProductQuantity(nextValue);
                    }}
                  />
                </TableCell>
                <TableCell>
                  {selectedProductId && isValidPositivePrice(newProductPrice) && /^\d+$/.test(newProductQuantity)
                    ? currencyFormat(Number(newProductQuantity) * Number(normalizePriceInput(newProductPrice)))
                    : ''}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    {!props.readOnly && (isAddingProduct || selectedProductId || productSearchValue) ? (
                      <Button size='sm' variant='light' onClick={resetNewProductRow}>
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={`${props.order.id}_${ticket.product_id}`}>
                <TableCell>{ticket.name}</TableCell>
                <TableCell width={'22%'}>
                  <Input
                    value={priceDrafts[ticket.product_id] ?? String(ticket.price)}
                    type='number'
                    step='0.5'
                    min='0'
                    variant='underlined'
                    isReadOnly={props.readOnly}
                    isInvalid={Boolean(priceErrors[ticket.product_id])}
                    errorMessage={priceErrors[ticket.product_id]}
                    onBeforeInput={onPriceBeforeInput}
                    onClick={stopTableKeyboardNavigation}
                    onFocus={stopTableKeyboardNavigation}
                    onKeyDown={stopTableKeyboardNavigation}
                    onWheel={disableNumberScroll}
                    onPaste={onPricePaste}
                    onChange={(ev) => {
                      const rawValue = ev.target.value;

                      if (rawValue === '') {
                        setPriceDrafts((currentDrafts) => ({ ...currentDrafts, [ticket.product_id]: '' }));
                        setPriceErrors((currentErrors) => ({
                          ...currentErrors,
                          [ticket.product_id]: 'Introduce un precio valido en pasos de 0,5',
                        }));
                        return;
                      }

                      if (!/^\d*([.,]\d{0,2})?$/.test(rawValue)) return;

                      const nextPrice = Number(normalizePriceInput(rawValue));
                      if (Number.isNaN(nextPrice) || nextPrice < 0) {
                        setPriceDrafts((currentDrafts) => ({ ...currentDrafts, [ticket.product_id]: rawValue }));
                        setPriceErrors((currentErrors) => ({
                          ...currentErrors,
                          [ticket.product_id]: 'Introduce un precio valido en pasos de 0,5',
                        }));
                        return;
                      }

                      setEditableTickets((currentTickets) =>
                        currentTickets.map((currentTicket) =>
                          currentTicket.product_id === ticket.product_id ? { ...currentTicket, price: nextPrice } : currentTicket
                        )
                      );
                      setPriceDrafts((currentDrafts) => {
                        const nextDrafts = { ...currentDrafts };
                        delete nextDrafts[ticket.product_id];
                        return nextDrafts;
                      });
                      setPriceErrors((currentErrors) => {
                        const nextErrors = { ...currentErrors };
                        delete nextErrors[ticket.product_id];
                        return nextErrors;
                      });
                    }}
                  />
                </TableCell>
                <TableCell width={'20%'}>
                  <Input
                    value={quantityDrafts[ticket.product_id] ?? String(ticket.quantity)}
                    type='number'
                    step='1'
                    min='0'
                    max={ticket.stockable ? String(ticket.available_stock) : undefined}
                    variant='underlined'
                    isReadOnly={props.readOnly}
                    isInvalid={Boolean(quantityErrors[ticket.product_id])}
                    errorMessage={quantityErrors[ticket.product_id]}
                    onBeforeInput={onQuantityBeforeInput}
                    onClick={stopTableKeyboardNavigation}
                    onFocus={stopTableKeyboardNavigation}
                    onKeyDown={onQuantityKeyDown}
                    onWheel={disableNumberScroll}
                    onPaste={onQuantityPaste}
                    onChange={(ev) => onQuantityChange(ticket.product_id, ev.target.value)}
                  />
                </TableCell>
                <TableCell>{currencyFormat(ticket.quantity * ticket.price)}</TableCell>
                <TableCell>
                  {!props.readOnly ? <TrashIcon onClick={() => onRemoveTicket(ticket.product_id)} /> : null}
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>

      <div className='text-right font-semibold'>Total: {currencyFormat(orderTotal)}</div>

      <div className='flex justify-end gap-2'>
        <Button variant='light' onPress={props.onCancel}>
          {props.readOnly ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!props.readOnly ? (
          <Button color='primary' onPress={onSave} isDisabled={isSaving} isLoading={isSaving}>
            Guardar cambios
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default EditPendingOrderTickets;
