import React, { createContext, useContext } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const currency = 'INR (₹)';

  const getSymbol = () => {
    return '₹';
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    
    // Indian number formatting e.g. ₹1,46,995
    const numStr = Math.abs(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
    return `${amount < 0 ? '-' : ''}₹${numStr}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: () => {}, getSymbol, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
