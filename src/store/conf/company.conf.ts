import { BASE_URL } from '@/commons/constants';

export const companyConf = {
  host: BASE_URL,
  endpoints: {
    getCompanies: '/companies',
    createCompany: '/companies/createCompany',
    activeCompany: '/companies/active/${id}',
    editCompany: '/companies/${id}',
  },
};
