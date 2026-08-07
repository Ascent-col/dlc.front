import { BASE_URL } from '@/commons/constants';

export const userConf = {
  host: BASE_URL,
  endpoints: {
    getUsers: '/users',
    getUsersWithLastLocation: '/users/user/withalllastlocation',
    getUserById: '/users/${id}',
    getUsersWithLastLocationByCompanyId:
      '/users/user/withLastLocation/${companyId}',
    getUserWithLastLocationById: '/lastlocations/${id}',
    addNewUser: '/users/createUser',
    activeUser: '/users/active/${id}',
    editUser: '/users/${id}',
    editPasswordUser: '/users/updatepassword/${id}',
  },
};
