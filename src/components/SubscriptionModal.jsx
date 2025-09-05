import React, { useState } from 'react';
import { Crown, Check, X, Zap, Users, BarChart3, Key } from 'lucide-react';
import { useSubscription, SUBSCRIPTION_TIERS, TIER_FEATURES } from '../contexts/SubscriptionContext';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

const SubscriptionModal = ({ isOpen, onClose, highlightTier = null }) => {
  const { currentTier, usage } = useSubscription();
  const [selectedTier, setSelectedTier] = useState(highlightTier || SUBSCRIPTION_TIERS.PRO);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (tier) => {
    setLoading(true);
    
    // In production, this would integrate with a payment processor like Stripe
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and close modal
      alert(`Successfully upgraded to ${TIER_FEATURES[tier].name}! 🎉`);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case SUBSCRIPTION_TIERS.FREE:
        return <Users className="w-5 h-5" />;
      case SUBSCRIPTION_TIERS.PRO:
        return <Zap className="w-5 h-5" />;
      case SUBSCRIPTION_TIERS.BUSINESS:
        return <Crown className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case SUBSCRIPTION_TIERS.FREE:
        return 'text-gray-400';
      case SUBSCRIPTION_TIERS.PRO:
        return 'text-primary';
      case SUBSCRIPTION_TIERS.BUSINESS:
        return 'text-accent';
      default:
        return 'text-gray-400';
    }
  };

  const isCurrentTier = (tier) => currentTier === tier;
  const isUpgrade = (tier) => {
    const tierOrder = [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.BUSINESS];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
              <p className="text-text-secondary mt-1">
                Unlock more networks and advanced features
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Current Usage */}
        <div className="p-6 border-b border-gray-700 bg-bg/50">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Current Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">Networks</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {usage.networks_connected}
                <span className="text-sm text-text-secondary ml-1">
                  / {TIER_FEATURES[currentTier].limits.networks === Infinity ? '∞' : TIER_FEATURES[currentTier].limits.networks}
                </span>
              </div>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">Posts Today</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {usage.posts_fetched_today}
                <span className="text-sm text-text-secondary ml-1">
                  / {TIER_FEATURES[currentTier].limits.posts_per_day === Infinity ? '∞' : TIER_FEATURES[currentTier].limits.posts_per_day}
                </span>
              </div>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-text-primary">API Access</span>
              </div>
              <div className="text-sm text-text-primary">
                {TIER_FEATURES[currentTier].limits.api_access ? (
                  <span className="text-green-400">Available</span>
                ) : (
                  <span className="text-red-400">Not Available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(TIER_FEATURES).map(([tier, info]) => (
              <div
                key={tier}
                className={`relative rounded-lg border-2 p-6 transition-all ${
                  selectedTier === tier
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-700 bg-surface hover:border-gray-600'
                } ${isCurrentTier(tier) ? 'ring-2 ring-accent' : ''}`}
              >
                {/* Current Plan Badge */}
                {isCurrentTier(tier) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-black px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Popular Badge */}
                {tier === SUBSCRIPTION_TIERS.PRO && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-4 ${getTierColor(tier)}`}>
                    {getTierIcon(tier)}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">{info.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-text-primary">
                      ${info.price}
                    </span>
                    {info.price > 0 && (
                      <span className="text-text-secondary">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="mt-auto">
                  {isCurrentTier(tier) ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : isUpgrade(tier) ? (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleUpgrade(tier)}
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        `Upgrade to ${info.name}`
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled
                    >
                      Downgrade
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-text-primary">Can I change my plan anytime?</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">What happens to my data if I downgrade?</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Your data is always safe. If you exceed the limits of a lower tier, some features may be restricted until you upgrade again.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Do you offer refunds?</h4>
                <p className="text-sm text-text-secondary mt-1">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
