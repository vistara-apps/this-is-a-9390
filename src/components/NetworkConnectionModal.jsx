import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, ExternalLink, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { networkConnector } from '../services/networkConnector';
import Button from './ui/Button';
import Input from './ui/Input';
import LoadingSpinner from './ui/LoadingSpinner';

const NetworkConnectionModal = ({ network, isOpen, onClose, onSuccess }) => {
  const { walletAddress, isWalletConnected, connectNetwork } = useAuth();
  const [step, setStep] = useState('requirements'); // requirements, connecting, success, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [requirements, setRequirements] = useState(null);

  useEffect(() => {
    if (network && isOpen) {
      const reqs = networkConnector.getConnectionRequirements(network.id);
      setRequirements(reqs);
      setStep('requirements');
      setError(null);
      setFormData({});
    }
  }, [network, isOpen]);

  if (!isOpen || !network) return null;

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('connecting');

      // Check if wallet is required and connected
      if (network.authentication_method === 'wallet' && !isWalletConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Connect to the network
      const connectionResult = await networkConnector.connectToNetwork(
        network.id,
        walletAddress,
        formData
      );

      // Save connection to user profile
      await connectNetwork(network.id, connectionResult.connection_data);

      setStep('success');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.(network);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Connection failed:', err);
      setError(err.message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    if (!requirements?.fields) return true;
    
    return requirements.fields.every(field => {
      if (field.required) {
        return formData[field.name] && formData[field.name].trim() !== '';
      }
      return true;
    });
  };

  const renderRequirements = () => (
    <div className="space-y-6">
      {/* Network Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Connect to {network.name}
        </h3>
        <p className="text-text-secondary text-sm">
          {network.description}
        </p>
      </div>

      {/* Connection Method */}
      {requirements && (
        <div className="bg-bg rounded-lg p-4 border border-gray-700">
          <h4 className="font-medium text-text-primary mb-2">
            {requirements.title}
          </h4>
          <p className="text-sm text-text-secondary mb-3">
            {requirements.description}
          </p>
          
          {/* Prerequisites */}
          {requirements.prerequisites.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-text-primary">Prerequisites:</div>
              <ul className="space-y-1">
                {requirements.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-text-secondary">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Form Fields */}
      {requirements?.fields && requirements.fields.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-text-primary">Connection Details</h4>
          {requirements.fields.map((field) => (
            <Input
              key={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              error={error && field.required && !formData[field.name] ? `${field.label} is required` : null}
            />
          ))}
        </div>
      )}

      {/* Wallet Connection Warning */}
      {network.authentication_method === 'wallet' && !isWalletConnected && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-200">Wallet Required</span>
          </div>
          <p className="text-sm text-yellow-300 mt-1">
            You need to connect your wallet before connecting to this network.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConnect}
          disabled={!isFormValid() || (network.authentication_method === 'wallet' && !isWalletConnected)}
          className="flex-1"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect
        </Button>
      </div>

      {/* External Link */}
      <div className="text-center">
        <a
          href={network.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-sm text-primary hover:underline"
        >
          <span>Visit {network.name}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );

  const renderConnecting = () => (
    <div className="text-center space-y-6">
      <LoadingSpinner size="lg" text="Connecting to network..." />
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Connecting to {network.name}
        </h3>
        <p className="text-text-secondary text-sm">
          Please follow any prompts in your browser or wallet...
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Successfully Connected!
        </h3>
        <p className="text-text-secondary text-sm">
          You're now connected to {network.name}. You can start seeing posts from this network in your unified feed.
        </p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Connection Failed
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          {error || 'An unexpected error occurred while connecting to the network.'}
        </p>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => setStep('requirements')}
            className="flex-1"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'requirements':
        return renderRequirements();
      case 'connecting':
        return renderConnecting();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderRequirements();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Network Connection
            </h2>
            {step !== 'connecting' && (
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default NetworkConnectionModal;
