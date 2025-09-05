import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { authService, userService } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address && !user) {
      // Auto-authenticate when wallet is connected
      handleWalletAuth();
    } else if (!isConnected && user) {
      // Sign out when wallet is disconnected
      signOut();
    }
  }, [isConnected, address, user]);

  const initializeAuth = async () => {
    try {
      const session = await authService.getSession();
      setSession(session);
      
      if (session?.user) {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAuth = async () => {
    if (!address || !signMessageAsync) return;

    try {
      setLoading(true);
      
      // Create a message to sign for authentication
      const message = `Sign this message to authenticate with NexusFeed.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      // Sign the message
      const signature = await signMessageAsync({ message });
      
      // Authenticate with Supabase (this is a simplified version)
      // In production, you'd verify the signature on the backend
      const authData = await authService.signInWithWallet(address, signature);
      
      // Create or update user profile
      if (authData.user) {
        const profileData = {
          wallet_address: address,
          display_name: `User ${address.slice(0, 6)}...${address.slice(-4)}`,
          avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
          created_at: new Date().toISOString()
        };
        
        await userService.upsertProfile(authData.user.id, profileData);
        const userData = await userService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Wallet authentication failed:', error);
      // Handle authentication failure gracefully
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const updatedProfile = await userService.upsertProfile(user.id, profileData);
      setUser({ ...user, profile: updatedProfile });
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const connectNetwork = async (networkId, connectionData = {}) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const networkConnection = await userService.connectNetwork(
        user.id, 
        networkId, 
        connectionData
      );
      
      // Refresh user data to include new network connection
      const userData = await userService.getCurrentUser();
      setUser(userData);
      
      return networkConnection;
    } catch (error) {
      console.error('Error connecting to network:', error);
      throw error;
    }
  };

  const disconnectNetwork = async (networkId) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await userService.disconnectNetwork(user.id, networkId);
      
      // Refresh user data
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error disconnecting from network:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    walletAddress: address,
    isWalletConnected: isConnected,
    signOut,
    updateProfile,
    connectNetwork,
    disconnectNetwork,
    handleWalletAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
