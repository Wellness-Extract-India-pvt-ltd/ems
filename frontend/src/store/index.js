import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './slices/employeeSlice';
import assetReducer from './slices/assetSlice';
import assetFilterReducer from './slices/assetFilterSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import softwareReducer from './slices/softwareSlice';
import licenseReducer from './slices/licenseSlice';
import ticketReducer from './slices/ticketSlice';
import auditLogReducer from './slices/auditLogSlice';
import integrationsReducer from './slices/integrationSlice';
import chatReducer from './slices/chatSlice';
import dashboardReducer from './slices/dashboardSlice';
import hardwareReducer from './slices/hardwareSlice';
import activityReducer from './slices/activitySlice';
import timeTrackingReducer from './slices/timeTrackingSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        assetFilter: assetFilterReducer,
        employees: employeeReducer,
        assets: assetReducer,
        hardware: hardwareReducer,
        software: softwareReducer,
        licenses: licenseReducer,
        tickets: ticketReducer,
        auditLogs: auditLogReducer,
        integrations: integrationsReducer,
        chat: chatReducer,
        dashboard: dashboardReducer,
        activities: activityReducer,
        timeTracking: timeTrackingReducer,
    },

    devTools: import.meta.env.MODE === 'development',
});

export default store;
