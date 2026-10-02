import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <FinancialProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </FinancialProvider>
  );
}
