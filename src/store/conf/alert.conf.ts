import { BASE_URL } from '@/commons/constants';

export const alertConf = {
  host: BASE_URL,
  endpoints: {
    getAlerts: '/alerts/alertsbycompany/${idCompany}',
    getAlertsNoRead: '/alerts/activealertsbycompany/${idCompany}',
    getAlertById: '/alerts/alertsbyid/${id}',
    changeAlertStatus: (id: number) => `/alerts/changestatus/${id}`,
    notifyAlertMobile: '/notifications/send',
  },
};
