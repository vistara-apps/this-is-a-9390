import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService } from '../services/supabase';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription tiers and features
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business'
};

export const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'Access to network directory',
      'Connect to 1 network',
      'Basic unified feed',
      'Community support'
    ],
    limits: {
      networks: 1,
      posts_per_day: 100,
      analytics: false,
      real_time: false,
      api_access: false
    }
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    name: 'Pro',
    price: 5,
    features: [
      'Connect to up to 5 networks',
      'Advanced feed filtering',
      'Real-time updates',
      'Basic analytics',
      'Priority support'
    ],
    limits: {
      networks: 5,
      posts_per_day: 1000,
      analytics: true,
      real_time: true,
      api_access: false
    }
  },
  [SUBSCRIPTION_TIERS.BUSINESS]: {
    name: 'Business',
    price: 20,
    features: [
      'Unlimited network connections',
      'Advanced analytics dashboard',
      'API access',
      'Custom integrations',
      'Dedicated support'
    ],
    limits: {
      networks: Infinity,
      posts_per_day: Infinity,
      analytics: true,
      real_time: true,
      api_access: true
    }
  }
};

export const FEATURE_KEYS = {
  BASIC_FEED: 'basic_feed',
  NETWORK_DIRECTORY: 'network_directory',
  SINGLE_NETWORK: 'single_network',
  MULTIPLE_NETWORKS: 'multiple_networks',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  REAL_TIME_UPDATES: 'real_time_updates',
  API_ACCESS: 'api_access',
  PRIORITY_SUPPORT: 'priority_support'
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    networks_connected: 0,
    posts_fetched_today: 0,
    api_calls_today: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscription();
      loadUsage();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const sub = await subscriptionService.getSubscription(user.id);
      setSubscription(sub);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUsage = async () => {
    // In production, this would fetch actual usage data
    // For now, we'll simulate some usage
    setUsage({
      networks_connected: user?.connectedNetworks?.length || 0,
      posts_fetched_today: Math.floor(Math.random() * 50),
      api_calls_today: Math.floor(Math.random() * 10)
    });
  };

  const getCurrentTier = () => {
    if (!subscription || !subscription.is_active) {
      return SUBSCRIPTION_TIERS.FREE;
    }
    return subscription.tier;
  };

  const getTierInfo = (tier = null) => {
    const currentTier = tier || getCurrentTier();
    return TIER_FEATURES[currentTier];
  };

  const hasFeatureAccess = (feature) => {
    const tier = getCurrentTier();
    
    // Free tier features
    const freeFeatures = [
      FEATURE_KEYS.BASIC_FEED,
      FEATURE_KEYS.NETWORK_DIRECTORY,
      FEATURE_KEYS.SINGLE_NETWORK
    ];

    if (tier === SUBSCRIPTION_TIERS.FREE) {
      return freeFeatures.includes(feature);
    }

    // Pro tier features
    const proFeatures = [
      ...freeFeatures,
      FEATURE_KEYS.MULTIPLE_NETWORKS,
      FEATURE_KEYS.REAL_TIME_UPDATES,
      FEATURE_KEYS.ADVANCED_ANALYTICS,
      FEATURE_KEYS.PRIORITY_SUPPORT
    ];

    if (tier === SUBSCRIPTION_TIERS.PRO) {
      return proFeatures.includes(feature);
    }

    // Business tier has all features
    if (tier === SUBSCRIPTION_TIERS.BUSINESS) {
      return true;
    }

    return false;
  };

  const canConnectMoreNetworks = () => {
    const tierInfo = getTierInfo();
    return usage.networks_connected < tierInfo.limits.networks;
  };

  const getRemainingNetworks = () => {
    const tierInfo = getTierInfo();
    if (tierInfo.limits.networks === Infinity) {
      return Infinity;
    }
    return Math.max(0, tierInfo.limits.networks - usage.networks_connected);
  };

  const isAtLimit = (limitType) => {
    const tierInfo = getTierInfo();
    
    switch (limitType) {
      case 'networks':
        return usage.networks_connected >= tierInfo.limits.networks;
      case 'posts':
        return usage.posts_fetched_today >= tierInfo.limits.posts_per_day;
      case 'api':
        return !tierInfo.limits.api_access;
      default:
        return false;
    }
  };

  const getUpgradeMessage = (feature) => {
    const currentTier = getCurrentTier();
    
    if (currentTier === SUBSCRIPTION_TIERS.FREE) {
      return {
        title: 'Upgrade to Pro',
        message: 'Unlock advanced features and connect to more networks',
        targetTier: SUBSCRIPTION_TIERS.PRO,
        price: TIER_FEATURES[SUBSCRIPTION_TIERS.PRO].price
      };
    }
    
    if (currentTier === SUBSCRIPTION_TIERS.PRO) {
      return {
        title: 'Upgrade to Business',
        message: 'Get unlimited access and API integration',
        targetTier: SUBSCRIPTION_TIERS.BUSINESS,
        price: TIER_FEATURES[SUBSCRIPTION_TIERS.BUSINESS].price
      };
    }
    
    return null;
  };

  const trackUsage = (type, amount = 1) => {
    setUsage(prev => ({
      ...prev,
      [type]: prev[type] + amount
    }));
  };

  const value = {
    subscription,
    loading,
    usage,
    currentTier: getCurrentTier(),
    tierInfo: getTierInfo(),
    hasFeatureAccess,
    canConnectMoreNetworks,
    getRemainingNetworks,
    isAtLimit,
    getUpgradeMessage,
    trackUsage,
    loadSubscription,
    SUBSCRIPTION_TIERS,
    TIER_FEATURES,
    FEATURE_KEYS
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
