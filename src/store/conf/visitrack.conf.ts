import { BASE_URL } from '@/commons/constants';

export const visitrackConf = {
  host: BASE_URL,
  endpoints: {
    surveys: '/integrations/visitrack/surveys',
    users: '/integrations/visitrack/users',
    stats: '/integrations/visitrack/activity/stats',
    counters: '/integrations/visitrack/activity/counters',
  },
};
