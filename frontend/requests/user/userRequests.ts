import axios from 'axios';
import { UserEntity } from '../../domain/entities/user/user.entity';

const USERS_PATH = 'http://localhost:3000/api/v1/users';

interface UserService {
  getUsers: () => Promise<{ data: UserEntity[]; status: number }>;
  searchUsers: (query: string) => Promise<{ data: UserEntity[]; status: number }>;
  editUser: (id: number, user: { user: { name: string; member: boolean; disabled?: boolean } }) => Promise<any>;
  saveUser: (user: { user: { name: string; member: boolean; disabled?: boolean } }) => Promise<any>;
  disableUser: (id: number) => Promise<any>;
}

export const userRequests = (): UserService => {
  return <UserService><unknown>{
    getUsers: async () => {
      const response = await axios.get(USERS_PATH);

      return {
        data: response.data.sort((a: UserEntity, b: UserEntity) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1)),
        status: response.status,
      };
    },
    searchUsers: async (query: string) => {
      const response = await axios.get(`${USERS_PATH}/search`, {
        params: { q: query },
      });

      return {
        data: response.data,
        status: response.status,
      };
    },
    saveUser: async (user: { user: { name: string; member: boolean; disabled?: boolean } }) => {
      const response = await axios.post(USERS_PATH, user);

      return response;
    },
    editUser: async (id: number, user: { user: { name: string; member: boolean; disabled?: boolean } }) => {
      const response = await axios.patch(`${USERS_PATH}/${id}`, user);

      return response;
    },
    disableUser: async (id: number) => {
      const response = await axios.delete(`${USERS_PATH}/${id}`);

      return response;
    },
  };
};
