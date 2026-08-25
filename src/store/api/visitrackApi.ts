import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { visitrackConf } from '../conf/visitrack.conf';

export const visitrackApi = createApi({
  reducerPath: 'apiVisitrack',
  keepUnusedDataFor: 60,
  baseQuery: fetchBaseQuery({
    baseUrl: visitrackConf.host,
    prepareHeaders: (headers) => {
      const token =
        typeof window === 'undefined'
          ? null
          : window.localStorage.getItem('authToken');
      headers.set('Accept', 'application/json');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['VisitrackSurveys', 'VisitrackUsers', 'VisitrackActivity'],
  endpoints: () => ({}),
});
