import { useSubscription, FEATURE_KEYS } from '../contexts/SubscriptionContext';

export const useFeatureAccess = () => {
  const {
    hasFeatureAccess,
    canConnectMoreNetworks,
    getRemainingNetworks,
    isAtLimit,
    getUpgradeMessage,
    currentTier,
    usage
  } = useSubscription();

  // Feature access helpers
  const canAccessFeature = (feature) => {
    return hasFeatureAccess(feature);
  };

  const requiresUpgrade = (feature) => {
    return !hasFeatureAccess(feature);
  };

  // Network connection helpers
  const canConnectNetwork = () => {
    return canConnectMoreNetworks();
  };

  const getNetworkLimitMessage = () => {
    if (canConnectMoreNetworks()) {
      const remaining = getRemainingNetworks();
      if (remaining === Infinity) {
        return 'Unlimited network connections available';
      }
      return `${remaining} more network${remaining !== 1 ? 's' : ''} can be connected`;
    }
    
    const upgrade = getUpgradeMessage(FEATURE_KEYS.MULTIPLE_NETWORKS);
    return {
      message: 'Network connection limit reached',
      upgrade: upgrade
    };
  };

  // Analytics access
  const canAccessAnalytics = () => {
    return canAccessFeature(FEATURE_KEYS.ADVANCED_ANALYTICS);
  };

  // Real-time updates
  const canAccessRealTime = () => {
    return canAccessFeature(FEATURE_KEYS.REAL_TIME_UPDATES);
  };

  // API access
  const canAccessAPI = () => {
    return canAccessFeature(FEATURE_KEYS.API_ACCESS);
  };

  // Usage limit helpers
  const isNearLimit = (limitType, threshold = 0.8) => {
    switch (limitType) {
      case 'networks':
        const networkLimit = usage.networks_connected;
        return networkLimit >= threshold * networkLimit;
      case 'posts':
        return usage.posts_fetched_today >= threshold * usage.posts_per_day;
      default:
        return false;
    }
  };

  const getUsagePercentage = (limitType) => {
    switch (limitType) {
      case 'networks':
        const tierInfo = useSubscription().tierInfo;
        if (tierInfo.limits.networks === Infinity) return 0;
        return (usage.networks_connected / tierInfo.limits.networks) * 100;
      case 'posts':
        if (tierInfo.limits.posts_per_day === Infinity) return 0;
        return (usage.posts_fetched_today / tierInfo.limits.posts_per_day) * 100;
      default:
        return 0;
    }
  };

  // Feature gate component helper
  const createFeatureGate = (feature, fallbackComponent = null) => {
    return (children) => {
      if (canAccessFeature(feature)) {
        return children;
      }
      
      if (fallbackComponent) {
        return fallbackComponent;
      }
      
      const upgrade = getUpgradeMessage(feature);
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-text-secondary mb-2">
            This feature requires {upgrade?.targetTier} plan
          </div>
          <button className="text-primary hover:underline text-sm">
            Upgrade to unlock
          </button>
        </div>
      );
    };
  };

  // Upgrade prompt helpers
  const shouldShowUpgradePrompt = (feature) => {
    return requiresUpgrade(feature);
  };

  const getUpgradePrompt = (feature) => {
    if (!requiresUpgrade(feature)) return null;
    
    const upgrade = getUpgradeMessage(feature);
    return {
      title: upgrade?.title,
      message: upgrade?.message,
      price: upgrade?.price,
      tier: upgrade?.targetTier,
      feature: feature
    };
  };

  return {
    // Feature access
    canAccessFeature,
    requiresUpgrade,
    canAccessAnalytics,
    canAccessRealTime,
    canAccessAPI,
    
    // Network connections
    canConnectNetwork,
    canConnectMoreNetworks,
    getRemainingNetworks,
    getNetworkLimitMessage,
    
    // Usage tracking
    isAtLimit,
    isNearLimit,
    getUsagePercentage,
    
    // Upgrade helpers
    shouldShowUpgradePrompt,
    getUpgradePrompt,
    getUpgradeMessage,
    
    // Utilities
    createFeatureGate,
    
    // Direct access to subscription data
    currentTier,
    usage,
    
    // Feature constants for convenience
    FEATURES: FEATURE_KEYS
  };
};

export default useFeatureAccess;
