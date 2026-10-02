import React from 'react';
import { HashRouter } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <FinancialProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </FinancialProvider>
  );
}
