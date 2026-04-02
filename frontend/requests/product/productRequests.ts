import axios from 'axios';
import { ProductEntity } from '../../domain/entities/product/product.entity';
import { getApiBaseUrl } from '../../shared/config/runtime';

const PRODUCTS_PATH = `${getApiBaseUrl()}/api/v1/products`

interface ProductService {
  getProducts: () => Promise<ProductEntity[]>;
  saveProduct: (product: any) => Promise<ProductEntity>;
  editProduct: (order: any) => Promise<any>;
}

export const productRequests = (): any => {
  return <ProductService><unknown>{
    getProducts: async () => {
      const response = await axios.get(PRODUCTS_PATH)

      return {
        data: response?.data?.data.sort((a: any, b: any) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1),
        status: response.status
      };
    },
    saveProduct: async (product: any) => {
      const response = await axios.post(
        PRODUCTS_PATH,
        product,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response;
    },
    editProduct: async (id: number, product: any) => {
      const response = await axios.patch(
        `${PRODUCTS_PATH}/${id}`,
        {
          price: product.price,
          price_members: product.price_members,
          price_tikis: product.price_tikis,
          stockable: product.stockable,
        }
      )
      return response;
    },
  };
};
