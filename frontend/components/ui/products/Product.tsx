import { FC } from 'react';
import ProductsList from './ProductsList';

interface ProductProps {
  onProductPress: (product: any) => void;
  filteredItems: any;
}

const Product: FC<ProductProps> = (props: ProductProps) => {
  return <ProductsList onProductPress={props.onProductPress} products={props.filteredItems} />;
};

export default Product;
