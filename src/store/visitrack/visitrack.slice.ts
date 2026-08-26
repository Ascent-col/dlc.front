import {
  VisitrackActivityStats,
  VisitrackCountersResponse,
  VisitrackFilters,
  VisitrackSurvey,
  VisitrackUser,
} from '@/modules/dashboard/dashboard.types';
import { visitrackApi } from '../api/visitrackApi';
import { visitrackConf } from '../conf/visitrack.conf';

export const toVisitrackParams = ({
  from,
  to,
  surveyIds,
}: VisitrackFilters) => ({
  from,
  to,
  ...(surveyIds?.length ? { surveyIds: surveyIds.join(',') } : {}),
});

export const visitrackApiSlice = visitrackApi.injectEndpoints({
  endpoints: (builder) => ({
    getVisitrackSurveys: builder.query<VisitrackSurvey[], void>({
      query: () => ({ url: visitrackConf.endpoints.surveys, method: 'GET' }),
      providesTags: ['VisitrackSurveys'],
    }),
    getVisitrackUsers: builder.query<VisitrackUser[], void>({
      query: () => ({ url: visitrackConf.endpoints.users, method: 'GET' }),
      providesTags: ['VisitrackUsers'],
    }),
    getVisitrackStats: builder.query<VisitrackActivityStats, VisitrackFilters>({
      query: (filters) => ({
        url: visitrackConf.endpoints.stats,
        method: 'GET',
        params: toVisitrackParams(filters),
      }),
      providesTags: ['VisitrackActivity'],
    }),
    getVisitrackCounters: builder.query<
      VisitrackCountersResponse,
      VisitrackFilters
    >({
      query: (filters) => ({
        url: visitrackConf.endpoints.counters,
        method: 'GET',
        params: toVisitrackParams(filters),
      }),
      providesTags: ['VisitrackActivity'],
    }),
  }),
});

export const {
  useGetVisitrackSurveysQuery,
  useGetVisitrackUsersQuery,
  useGetVisitrackStatsQuery,
  useGetVisitrackCountersQuery,
} = visitrackApiSlice;
