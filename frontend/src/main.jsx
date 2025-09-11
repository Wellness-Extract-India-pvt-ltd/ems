import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import './styles/tailwind.css'
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/context/AuthProvider';

const rootElement = document.getElementById('root')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <Provider store={store} >
        <AppRoutes />
        <Toaster position="top-right" />
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);