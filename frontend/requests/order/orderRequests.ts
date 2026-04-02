import axios from 'axios';
import { getApiBaseUrl } from '../../shared/config/runtime';

const ORDERS_PATH = `${getApiBaseUrl()}/api/v1/orders`

interface OrderService {
  getOrders: () => Promise<any[]>;
  saveOrder: (order: any) => Promise<any>;
  payOrder: (order: any) => Promise<any>;
}

export const orderRequests = (): OrderService => {
  return <OrderService><unknown>{
    getOrders: async () => {
      const response = await axios.get(ORDERS_PATH)

      return response?.data;
    },
    saveOrder: async (order: any) => {
      const response = await axios.post(
        ORDERS_PATH,
        order
      )

      return response;
    },
    payOrder: async (order: any) => {
      const response = await axios.patch(
        `${ORDERS_PATH}/${order.id}`,
        {paid: true}
      )

      return response;
    },
  };
};
