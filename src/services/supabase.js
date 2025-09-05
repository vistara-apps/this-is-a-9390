import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database schema types
export const TABLES = {
  USERS: 'users',
  USER_NETWORKS: 'user_networks',
  USER_PREFERENCES: 'user_preferences',
  SUBSCRIPTIONS: 'subscriptions',
  POSTS_CACHE: 'posts_cache'
};

// User management functions
export const userService = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      return { ...user, profile };
    }
    
    return null;
  },

  // Create or update user profile
  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's connected networks
  async getUserNetworks(userId) {
    const { data, error } = await supabase
      .from(TABLES.USER_NETWORKS)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  // Connect user to a network
  async connectNetwork(userId, networkId, connectionData = {}) {
    const { data, error } = await supabase
      .from(TABLES.USER_NETWORKS)
      .upsert({
        user_id: userId,
        network_id: networkId,
        connection_data: connectionData,
        connected_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Disconnect user from a network
  async disconnectNetwork(userId, networkId) {
    const { error } = await supabase
      .from(TABLES.USER_NETWORKS)
      .update({ is_active: false, disconnected_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('network_id', networkId);
    
    if (error) throw error;
  },

  // Get user preferences
  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from(TABLES.USER_PREFERENCES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || {};
  },

  // Update user preferences
  async updatePreferences(userId, preferences) {
    const { data, error } = await supabase
      .from(TABLES.USER_PREFERENCES)
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Authentication functions
export const authService = {
  // Sign in with wallet (used with RainbowKit)
  async signInWithWallet(walletAddress, signature) {
    // This would typically verify the signature and create a session
    // For now, we'll use Supabase's built-in auth with a custom provider
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@wallet.local`,
      password: signature
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Subscription management
export const subscriptionService = {
  // Get user's subscription status
  async getSubscription(userId) {
    const { data, error } = await supabase
      .from(TABLES.SUBSCRIPTIONS)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Check if user has access to a feature
  async hasFeatureAccess(userId, feature) {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) {
      // Free tier features
      const freeFeatures = ['basic_feed', 'network_directory', 'single_network'];
      return freeFeatures.includes(feature);
    }
    
    // Premium features based on subscription tier
    const premiumFeatures = {
      pro: ['advanced_analytics', 'multiple_networks', 'real_time_updates'],
      business: ['advanced_analytics', 'multiple_networks', 'real_time_updates', 'api_access', 'priority_support']
    };
    
    return premiumFeatures[subscription.tier]?.includes(feature) || false;
  }
};

export default supabase;
