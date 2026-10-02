import React from 'react';
import { HashRouter } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <FinancialProvider>
      <NotificationProvider>
        <HashRouter>
          <AppLayout />
          <NotificationToastContainer />
        </HashRouter>
      </NotificationProvider>
    </FinancialProvider>
  );
}
