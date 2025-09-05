import React, { useState } from 'react';
import AppShell from './components/AppShell';
import NetworkDirectory from './components/NetworkDirectory';
import UnifiedFeed from './components/UnifiedFeed';
import { NetworkProvider } from './contexts/NetworkContext';

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
    <NetworkProvider>
      <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </AppShell>
    </NetworkProvider>
  );
}

export default App;