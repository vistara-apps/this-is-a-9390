import React, { useState } from 'react';
import AppShell from './components/AppShell';
import NetworkDirectory from './components/NetworkDirectory';
import UnifiedFeed from './components/UnifiedFeed';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { NetworkProvider } from './contexts/NetworkContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState('directory');

  const renderContent = () => {
    switch (activeTab) {
      case 'directory':
        return <NetworkDirectory />;
      case 'feed':
        return <UnifiedFeed />;
      default:
        return <NetworkDirectory />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NetworkProvider>
          <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
          </AppShell>
        </NetworkProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
