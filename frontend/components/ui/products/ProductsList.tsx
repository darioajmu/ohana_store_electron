import { FC } from 'react';
import ProductCard from './ProductCard';

interface ProductsListProps {
  onProductPress: (product: any) => void;
  products: any;
}

const ProductsList: FC<ProductsListProps> = (props: ProductsListProps) => {
  return props.products.map((product: any) => (
    <ProductCard key={product.id} product={product} onProductPress={props.onProductPress} />
  ));
};

export default ProductsList;
