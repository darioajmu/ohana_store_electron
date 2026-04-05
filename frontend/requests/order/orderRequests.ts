import axios from 'axios';

const ORDERS_PATH = 'http://localhost:3000/api/v1/orders'

interface OrderService {
  getOrders: () => Promise<any[]>;
  getPaidOrders: () => Promise<any[]>;
  getNotPaidOrders: () => Promise<any[]>;
  saveOrder: (order: any) => Promise<any>;
  payOrder: (order: any) => Promise<any>;
  updatePendingItems: (orderId: number, order: any) => Promise<any>;
}

export const orderRequests = (): OrderService => {
  return <OrderService><unknown>{
    getOrders: async () => {
      const response = await axios.get(ORDERS_PATH)

      return response?.data;
    },
    getPaidOrders: async () => {
      const response = await axios.get(`${ORDERS_PATH}/paid`)

      return response?.data;
    },
    getNotPaidOrders: async () => {
      const response = await axios.get(`${ORDERS_PATH}/not_paid`)

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
    updatePendingItems: async (orderId: number, order: any) => {
      const response = await axios.patch(
        `${ORDERS_PATH}/${orderId}/update_pending_items`,
        order
      )

      return response;
    },
  };
};
