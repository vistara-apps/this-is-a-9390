import React from 'react';
import { ExternalLink, Users, Activity } from 'lucide-react';
import Button from './ui/Button';
import { useNetwork } from '../contexts/NetworkContext';

const NetworkCard = ({ network, variant = 'interactive' }) => {
  const { connectedNetworks, connectToNetwork, isConnected } = useNetwork();
  const connected = isConnected(network.id);

  const handleConnect = () => {
    connectToNetwork(network);
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {network.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{network.name}</h3>
            <p className="text-sm text-text-secondary">{network.type}</p>
          </div>
        </div>
        {connected && (
          <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md">
            Connected
          </div>
        )}
      </div>

      <p className="text-text-secondary text-sm mb-4 leading-relaxed">
        {network.description}
      </p>

      <div className="flex items-center space-x-4 mb-4 text-sm text-text-secondary">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{network.userCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="w-4 h-4" />
          <span>{network.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {network.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-md"
            >
              {feature}
            </span>
          ))}
          {network.features.length > 2 && (
            <span className="px-2 py-1 bg-gray-700 text-text-secondary text-xs rounded-md">
              +{network.features.length - 2} more
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {network.url && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(network.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          {variant === 'interactive' && (
            <Button
              variant={connected ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleConnect}
              disabled={connected}
            >
              {connected ? 'Connected' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkCard;