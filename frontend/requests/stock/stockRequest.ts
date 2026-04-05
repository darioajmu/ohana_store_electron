import axios from 'axios';

const STOCK_PATH = 'http://localhost:3000/api/v1/product_quantities'

interface stockService {
  getStock: () => Promise<any[]>;
  editStock: (id: string, quantity: string) => Promise<any>;
}

export const stockRequests = (): stockService => {
  return <stockService><unknown>{
    getStock: async () => {
      const response = await axios.get(STOCK_PATH)

      return response?.data;
    },
    editStock: async (id: number, quantity: string) => {
      const response = await axios.patch(
        `${STOCK_PATH}/${id}`,
        {
          quantity: quantity,
        }
      )
      return response;
    },
  };
};
