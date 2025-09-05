import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Shield, Zap, Users } from 'lucide-react';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

const AuthModal = ({ isOpen, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const features = [
    {
      icon: <Shield className="w-5 h-5 text-accent" />,
      title: 'Secure Authentication',
      description: 'Connect securely using your Web3 wallet'
    },
    {
      icon: <Zap className="w-5 h-5 text-accent" />,
      title: 'Instant Access',
      description: 'Start aggregating feeds immediately after connecting'
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      title: 'Decentralized Networks',
      description: 'Access multiple decentralized social networks'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <p className="text-text-secondary text-sm mt-2">
            Connect your wallet to start using NexusFeed
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              variant="primary"
                              className="w-full"
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <LoadingSpinner size="sm" color="white" />
                              ) : (
                                <>
                                  <Wallet className="w-4 h-4 mr-2" />
                                  Connect Wallet
                                </>
                              )}
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={openChainModal}
                              variant="destructive"
                              className="w-full"
                            >
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <div className="text-center">
                            <div className="text-sm text-text-secondary mb-2">
                              Connected as
                            </div>
                            <Button
                              onClick={openAccountModal}
                              variant="secondary"
                              className="w-full"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            {/* Terms */}
            <p className="text-xs text-text-secondary text-center">
              By connecting your wallet, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
