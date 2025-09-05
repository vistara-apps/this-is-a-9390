import React, { createContext, useContext, useState } from 'react';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [connectedNetworks, setConnectedNetworks] = useState([]);

  const connectToNetwork = (network) => {
    if (!connectedNetworks.find(n => n.id === network.id)) {
      setConnectedNetworks(prev => [...prev, network]);
    }
  };

  const disconnectFromNetwork = (networkId) => {
    setConnectedNetworks(prev => prev.filter(n => n.id !== networkId));
  };

  const isConnected = (networkId) => {
    return connectedNetworks.some(n => n.id === networkId);
  };

  const value = {
    connectedNetworks,
    connectToNetwork,
    disconnectFromNetwork,
    isConnected,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};