import React, { useState } from 'react';
import { Search } from 'lucide-react';
import NetworkCard from './NetworkCard';
import Input from './ui/Input';
import { networks } from '../data/networks';

const NetworkDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredNetworks = networks.filter(network => {
    const matchesSearch = network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         network.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || network.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const networkTypes = ['all', ...new Set(networks.map(n => n.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">
          Unified Network Directory
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Discover and connect to decentralized communication networks. 
          Aggregate your conversations across the fragmented web3 ecosystem.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
          <Input
            placeholder="Search networks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          {networkTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Networks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNetworks.map((network) => (
          <NetworkCard
            key={network.id}
            network={network}
            variant="interactive"
          />
        ))}
      </div>

      {filteredNetworks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            No networks found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkDirectory;