import { Alert } from '@/types';
import { alertApi } from '../api/alertApi';
import { alertConf } from '../conf/alert.conf';

export const alertApiSlice = alertApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlerts: builder.query<Alert[], number>({
      query: (id: number) => ({
        url: alertConf.endpoints.getAlerts,
        method: 'GET',
        params: { idCompany: id },
      }),
      providesTags: ['Alerts'],
    }),
    getAlertsNoRead: builder.query<Alert[], number>({
      query: (id: number) => ({
        url: alertConf.endpoints.getAlertsNoRead,
        method: 'GET',
        params: { idCompany: id },
      }),
    }),
    getAlertById: builder.query<Alert, { id: string }>({
      query: ({ id }) => ({
        url: alertConf.endpoints.getAlertById,
        method: 'GET',
        params: { id },
      }),
    }),
    changeAlertStatus: builder.mutation({
      query: ({ id, status }: { id: number; status: number }) => ({
        url: alertConf.endpoints.changeAlertStatus(id),
        method: 'PUT',
        body: { status },
      }),
    }),
    notifyAlertMobile: builder.mutation({
      query: ({ iduser, date }) => ({
        url: alertConf.endpoints.notifyAlertMobile,
        method: 'POST',
        body: { iduser, date },
      }),
    }),
  }),
});

export const {
  useGetAlertsQuery,
  useLazyGetAlertsQuery,
  useGetAlertsNoReadQuery,
  useLazyGetAlertsNoReadQuery,
  useGetAlertByIdQuery,
  useChangeAlertStatusMutation,
  useNotifyAlertMobileMutation,
} = alertApiSlice;
