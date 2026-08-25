import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { userFeature } from './user/user.feature';
import { companyFeature } from './company/company.feature';
import { locationFeature } from './location/location.feature';
import { authFeature } from './auth/auth.feature';
import { roleFeature } from './role/role.feature';
import { alertApi } from './api/alertApi';
import { alertFeature } from './alert/alert.feature';
import { authApi } from './api/authApi';
import { companyApi } from './api/companyApi';
import { roleApi } from './api/roleApi';
import { locationApi } from './api/locationApi';
import { userApi } from './api/userApi';
import { visitrackApi } from './api/visitrackApi';

const IS_PRODUCTION = process.env.MODE === 'production';

const reducers = {
  // Cuando uses RTK Query, agregarías aquí:
  [userApi.reducerPath]: userApi.reducer,
  [alertApi.reducerPath]: alertApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [companyApi.reducerPath]: companyApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [locationApi.reducerPath]: locationApi.reducer,
  [visitrackApi.reducerPath]: visitrackApi.reducer,

  // users: userSliceReducer,
  // companies: companySliceReducer,
  // locations: locationSliceReducer,
  // auth: authSliceReducer,
  // roles: roleSliceReducer,
  // alerts: alertSliceReducer,
  [userFeature.name]: userFeature.reducer,
  [alertFeature.name]: alertFeature.reducer,
  [authFeature.name]: authFeature.reducer,
  [companyFeature.name]: companyFeature.reducer,
  [roleFeature.name]: roleFeature.reducer,
  [locationFeature.name]: locationFeature.reducer,
};

// Middlewares (listo para RTK Query en el futuro)
const apiMiddlewares = [
  alertApi.middleware,
  authApi.middleware,
  companyApi.middleware,
  roleApi.middleware,
  locationApi.middleware,
  userApi.middleware,
  visitrackApi.middleware,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const middleware = (getDefaultMiddleware: any) => {
  const defaultMiddleware = getDefaultMiddleware();
  return IS_PRODUCTION
    ? defaultMiddleware.concat(apiMiddlewares)
    : defaultMiddleware.concat(apiMiddlewares, logger);
};

// Configuración del store
export const store = configureStore({
  reducer: reducers,
  devTools: !IS_PRODUCTION,
  middleware,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const appDispatch = store.dispatch;
