export const alertConf = {
  host: process.env.NEXT_PUBLIC_BACKEND_URL,
  endpoints: {
    getAlerts: '/alerts/alertsbycompany/${idCompany}',
    getAlertsNoRead: '/alerts/activealertsbycompany/${idCompany}',
    getAlertById: '/alerts/alertsbyid/${id}',
    changeAlertStatus: (id: number) => `/alerts/changestatus/${id}`,
    notifyAlertMobile: '/notifications/send',
  },
};
