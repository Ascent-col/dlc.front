import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '@/types';
import { alertApiSlice } from './alert.slice';

type alertState = {
  alerts: Alert[];
  sctAlert: Alert[];
  alertsNoRead: Alert[];
};

const initialState: alertState = {
  alerts: [],
  sctAlert: [],
  alertsNoRead: [],
};

export const alertFeature = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addNewAlert: (state, action: PayloadAction<Alert>) => {
      if (state.alerts.find((alert) => alert.id === action.payload.id)) {
        return;
      }
      state.alerts.push(action.payload as Alert); // TODO: revisar  como hacer esto de forma correcta con TS  y RTK Query
      state.alertsNoRead.push(action.payload as Alert);
    },
    selectAlert: (state, action: PayloadAction<Alert[]>) => {
      state.sctAlert = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      alertApiSlice.endpoints.getAlerts.matchFulfilled,
      (state, action) => {
        state.alerts = action.payload;
      },
    );
    builder.addMatcher(
      alertApiSlice.endpoints.getAlertsNoRead.matchFulfilled,
      (state, action) => {
        state.alertsNoRead = action.payload;
      },
    );
    builder.addMatcher(
      alertApiSlice.endpoints.getAlertById.matchFulfilled,
      (state, action) => {
        state.sctAlert = [action.payload];
      },
    );
    builder.addMatcher(
      alertApiSlice.endpoints.changeAlertStatus.matchFulfilled,
      (state, action) => {
        state.alerts = state.alerts.map((alert) => {
          return alert?.id === action.payload[0]?.id
            ? {
                ...alert,
                status: action.payload[0].status,
              }
            : alert;
        });
        state.alertsNoRead = state.alertsNoRead.filter(
          (alert) => alert.id !== action.payload[0].id,
        );
      },
    );
  },
});

export const { selectAlert, addNewAlert } = alertFeature.actions;

export default alertFeature.reducer;
