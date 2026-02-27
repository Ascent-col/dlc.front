import type { RootState } from '@/store/store';
import {
  useActiveUserMutation,
  useAddNewUserMutation,
  useEditPasswordUserMutation,
  useEditUserMutation,
  useLazyGetUsersWithLastLocationByCompanyIdQuery,
  useLazyGetUsersWithLastLocationQuery,
} from '@/store/user/user.slice';
import { NewUser, User } from '@/types';
import { message } from 'antd';
import { omit } from 'lodash';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function useUser() {
  const { users } = useSelector((state: RootState) => state.users);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const [getUsers, { isLoading: isLoadingUsers }] =
    useLazyGetUsersWithLastLocationQuery();
  const [getUsersWLLByCompany, { isLoading: isLoadingUsersWLLByCompany }] =
    useLazyGetUsersWithLastLocationByCompanyIdQuery();
  const [createNewUser, { error: errorNewUser }] = useAddNewUserMutation();
  const [editUserMutation, { error: errorEditUser }] = useEditUserMutation();
  const [editPasswordUserMutation, { error: errorEditPasswordUser }] =
    useEditPasswordUserMutation();
  const [activeUserMutation, { error: errorActiveUser }] =
    useActiveUserMutation();

  const addNewUser = async (data: Partial<NewUser>) => {
    const { company, ...restData } = data;
    const newUser: Partial<NewUser> = {
      ...restData,
      createDate: new Date().toLocaleDateString(),
      companyId: Number(company),
    };
    await createNewUser(newUser);
    if (errorNewUser) message.error('El usuario no se ha creado exitosamente');
    message.success('El usuario se ha creado exitosamente');
  };

  const activeUser = async (id: number) => {
    await activeUserMutation(id);
    if (errorActiveUser)
      message.error('El estado de la compañía se actualizó correctamente');
    message.success('El estado de la compañía se actualizó correctamente');
  };

  const editUser = async (user: User) => {
    const infoEditUser = omit(user, 'lastLocation', 'company', 'password');
    await editUserMutation(infoEditUser);
    if (errorEditUser)
      message.error('El usuario no se ha modificado exitosamente');
    message.success('El usuario se ha modificado exitosamente');
  };

  const editPasswordUser = async (id: number, passsword: string) => {
    await editPasswordUserMutation({ id, newPassword: passsword });
    if (errorEditPasswordUser)
      message.error('El usuario no se ha modificado exitosamente');
    message.success('El usuario se ha modificado exitosamente');
  };

  const getUsersByRole = async (role: number) => {
    if (role === 2) {
      getUsersWLLByCompany(Number(currentUser.company.id));
      return;
    }
    getUsers();
  };

  useEffect(() => {
    getUsersByRole(currentUser.role);
  }, [currentUser]);

  return {
    users,
    isLoadingUsers,
    isLoadingUsersWLLByCompany,
    // fetchUsers,
    // fetchUsersWithLocation,
    // fetchUsersWithLastLocation,
    // fetchUsersWithLastLocationById,
    addNewUser,
    editUser,
    editPasswordUser,
    activeUser,
    getUsersByRole,
    // fetchUserById,
  };
}
