import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './slices/employeeSlice';
import assetReducer from './slices/assetSlice';
import assetFilterReducer from './slices/assetFilterSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import softwareReducer from './slices/softwareSlice';
import integrationsReducer from './slices/integrationSlice';
import licenseReducer from './slices/licenseSlice';
import ticketReducer from './slices/ticketSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        assetFilter: assetFilterReducer,
        employees: employeeReducer,
        assets: assetReducer,
        software: softwareReducer,
        licenses: licenseReducer,
        tickets: ticketReducer,
        integrations: integrationsReducer,
    },

    devTools: import.meta.env.MODE === 'development',
});

export default store;