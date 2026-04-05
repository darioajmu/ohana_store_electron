'use client';

import { useEffect, useMemo, useState } from 'react';
import Cart from '../cart/Cart';
import CreateProductDialog from '../products/CreateProductDialog';
import Product from '../products/Product';
import { productRequests } from '../../../requests/product/productRequests';
import { Input, Spinner } from '@nextui-org/react';
import { SearchIcon } from '../../icons';
import { useAppContext } from '../../../contexts/AppContext';
import { toast } from 'react-toastify';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [nameFilterValue, setNameFilterValue] = useState('');

  const { products, setProducts, ticketElements, setTicketElements, memberValue, calculateTotal } = useAppContext();

  const hasNameSearchFilter = Boolean(nameFilterValue);

  const filteredItems = useMemo(() => {
    let filteredProducts = [...products];

    if (hasNameSearchFilter) {
      filteredProducts = filteredProducts.filter((product) => {
        return product.name.toLowerCase().includes(nameFilterValue.toLowerCase());
      });
    }
    return filteredProducts;
  }, [hasNameSearchFilter, nameFilterValue, products]);

  const onNameSearchChange = (value: string) => {
    if (value) {
      setNameFilterValue(value);
    } else {
      setNameFilterValue('');
    }
  };

  useEffect(() => {
    const { getProducts } = productRequests();

    const fetchData = async () => {
      const response = await getProducts();
      setProducts(response.data);
      setNameFilterValue('');
      if (response.status === 200) setIsLoaded(true);
    };
    fetchData();
  }, [setProducts]);

  const onProductPress = (product: any) => {
    if (!product.available_for_sale) return;

    const ticketElement = ticketElements.find((ticketElement: any) => ticketElement.product_id === product.id);
    const quantityInCart = ticketElement?.quantity || 0;

    if (product.stockable && quantityInCart >= product.available_stock) {
      toast.error('No puedes anadir mas unidades porque no hay stock suficiente');
      return;
    }

    const defaultPrice = memberValue ? Number(product.price_members) : Number(product.price);

    if (ticketElement) {
      ticketElement.quantity++;
    } else {
      ticketElements.push({
        product_id: product.id,
        name: product.name,
        base_price: product.price,
        price: defaultPrice,
        price_members: product.price_members,
        stockable: product.stockable,
        available_stock: product.available_stock,
        quantity: 1,
      });
    }
    setTicketElements(ticketElements);
    calculateTotal(memberValue);
  };

  return (
    <>
      <CreateProductDialog />
      <div style={{ width: '40%', position: 'absolute' }}>
        <br />
        <Input
          value={nameFilterValue}
          onValueChange={onNameSearchChange}
          isClearable
          placeholder='Filtrar por nombre...'
          startContent={<SearchIcon />}
          size='sm'
          variant='underlined'
          disabled={!isLoaded}
        />
        <section className='flex flex-col justify-center gap-4 py-8 md:py-10'>
          {isLoaded ? (
            <div className='gap-2 grid grid-cols-2 sm:grid-cols-3'>
              <Product onProductPress={onProductPress} filteredItems={filteredItems} />
            </div>
          ) : (
            <Spinner label='Cargando...' color='primary' labelColor='foreground' size='lg' />
          )}
        </section>
      </div>
      <div style={{ width: '35%', float: 'right' }}>
        <Cart />
      </div>
    </>
  );
};

export default App;
