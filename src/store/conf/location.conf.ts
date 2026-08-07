import { BASE_URL } from '@/commons/constants';

export const locationConf = {
  host: BASE_URL,
  endpoints: {
    getLocationHistoryByUser:
      '/locations/historyByUser?start_date=${startDate}&final_date=${finalDate}&userId=${userId}',
  },
};
