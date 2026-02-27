import { User } from '@/types';
import { userApi } from '../api/userApi';
import { userConf } from '../conf/user.conf';

export const userApiSlice = userApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsersWithLastLocation: builder.query<User[], void>({
      query: () => ({
        url: userConf.endpoints.getUsersWithLastLocation,
        method: 'GET',
      }),
    }),
    getUserById: builder.query({
      query: (id: number) => ({
        url: userConf.endpoints.getUserById,
        method: 'GET',
        params: { id },
      }),
    }),
    getUsersWithLastLocationByCompanyId: builder.query({
      query: (companyId: number) => ({
        url: userConf.endpoints.getUsersWithLastLocationByCompanyId,
        method: 'GET',
        params: { companyId },
      }),
    }),
    getUserWithLastLocationById: builder.query({
      query: (id: number) => ({
        url: userConf.endpoints.getUserWithLastLocationById,
        method: 'GET',
        params: { id },
      }),
    }),
    addNewUser: builder.mutation({
      query: (data: Partial<User>) => ({
        url: userConf.endpoints.addNewUser,
        method: 'POST',
        body: data,
      }),
    }),
    editUser: builder.mutation<User, Partial<User>>({
      query: (data: Partial<User>) => ({
        url: userConf.endpoints.editUser,
        method: 'PUT',
        body: data,
      }),
    }),
    editPasswordUser: builder.mutation({
      query: ({ id, newPassword }: { id: number; newPassword: string }) => ({
        url: userConf.endpoints.editPasswordUser,
        method: 'PUT',
        body: newPassword,
        params: { id },
      }),
    }),
    activeUser: builder.mutation({
      query: (id: number) => ({
        url: userConf.endpoints.activeUser,
        method: 'PUT',
        params: { id },
      }),
    }),
  }),
});

export const {
  useGetUsersWithLastLocationQuery,
  useLazyGetUsersWithLastLocationQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUsersWithLastLocationByCompanyIdQuery,
  useLazyGetUsersWithLastLocationByCompanyIdQuery,
  useGetUserWithLastLocationByIdQuery,
  useAddNewUserMutation,
  useEditUserMutation,
  useEditPasswordUserMutation,
  useActiveUserMutation,
} = userApiSlice;
