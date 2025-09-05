import { networks } from '../data/networks';

// Network connection strategies
const connectionStrategies = {
  wallet: async (network, walletAddress) => {
    // For wallet-based authentication (Farcaster, Lens)
    return {
      type: 'wallet',
      address: walletAddress,
      connected_at: new Date().toISOString(),
      status: 'connected'
    };
  },

  oauth: async (network) => {
    // For OAuth-based authentication (Mastodon)
    const authUrl = `${network.url}/oauth/authorize?client_id=your_client_id&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=read`;
    
    return new Promise((resolve, reject) => {
      const popup = window.open(authUrl, 'oauth', 'width=600,height=600');
      
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('OAuth cancelled by user'));
        }
      }, 1000);

      // Listen for OAuth callback
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth_success') {
          clearInterval(checkClosed);
          popup.close();
          resolve({
            type: 'oauth',
            access_token: event.data.access_token,
            connected_at: new Date().toISOString(),
            status: 'connected'
          });
        } else if (event.data.type === 'oauth_error') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  },

  keypair: async (network) => {
    // For keypair-based authentication (Nostr)
    if (!window.nostr) {
      throw new Error('Nostr extension not found. Please install a Nostr browser extension.');
    }

    try {
      const publicKey = await window.nostr.getPublicKey();
      return {
        type: 'keypair',
        public_key: publicKey,
        connected_at: new Date().toISOString(),
        status: 'connected'
      };
    } catch (error) {
      throw new Error('Failed to connect to Nostr: ' + error.message);
    }
  },

  handle: async (network, handle) => {
    // For handle-based authentication (Bluesky)
    if (!handle) {
      throw new Error('Handle is required for Bluesky connection');
    }

    // In production, this would validate the handle with AT Protocol
    return {
      type: 'handle',
      handle: handle,
      connected_at: new Date().toISOString(),
      status: 'connected'
    };
  },

  account: async (network, credentials) => {
    // For account-based authentication (Diaspora)
    if (!credentials.username || !credentials.pod) {
      throw new Error('Username and pod are required for Diaspora connection');
    }

    return {
      type: 'account',
      username: credentials.username,
      pod: credentials.pod,
      connected_at: new Date().toISOString(),
      status: 'connected'
    };
  }
};

export const networkConnector = {
  // Get available networks
  getAvailableNetworks() {
    return networks;
  },

  // Get network by ID
  getNetwork(networkId) {
    return networks.find(n => n.id === networkId);
  },

  // Check if network connection is supported
  isConnectionSupported(networkId) {
    const network = this.getNetwork(networkId);
    return network && connectionStrategies[network.authentication_method];
  },

  // Get connection requirements for a network
  getConnectionRequirements(networkId) {
    const network = this.getNetwork(networkId);
    if (!network) return null;

    const requirements = {
      wallet: {
        title: 'Wallet Connection',
        description: 'Connect your Web3 wallet to authenticate',
        fields: [],
        prerequisites: ['Web3 wallet (MetaMask, WalletConnect, etc.)']
      },
      oauth: {
        title: 'OAuth Authentication',
        description: 'Authorize NexusFeed to access your account',
        fields: [],
        prerequisites: ['Active account on the network']
      },
      keypair: {
        title: 'Nostr Extension',
        description: 'Use your Nostr browser extension to connect',
        fields: [],
        prerequisites: ['Nostr browser extension (nos2x, Alby, etc.)']
      },
      handle: {
        title: 'Handle Authentication',
        description: 'Enter your Bluesky handle to connect',
        fields: [
          { name: 'handle', label: 'Handle', type: 'text', placeholder: 'username.bsky.social', required: true }
        ],
        prerequisites: ['Active Bluesky account']
      },
      account: {
        title: 'Account Details',
        description: 'Enter your Diaspora account information',
        fields: [
          { name: 'username', label: 'Username', type: 'text', placeholder: 'your-username', required: true },
          { name: 'pod', label: 'Pod URL', type: 'url', placeholder: 'https://diaspora.pod.com', required: true }
        ],
        prerequisites: ['Active Diaspora account']
      }
    };

    return requirements[network.authentication_method];
  },

  // Connect to a network
  async connectToNetwork(networkId, walletAddress = null, additionalData = {}) {
    const network = this.getNetwork(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const strategy = connectionStrategies[network.authentication_method];
    if (!strategy) {
      throw new Error(`Connection method ${network.authentication_method} not supported`);
    }

    try {
      let connectionData;

      switch (network.authentication_method) {
        case 'wallet':
          if (!walletAddress) {
            throw new Error('Wallet address is required for wallet authentication');
          }
          connectionData = await strategy(network, walletAddress);
          break;
        
        case 'oauth':
          connectionData = await strategy(network);
          break;
        
        case 'keypair':
          connectionData = await strategy(network);
          break;
        
        case 'handle':
          if (!additionalData.handle) {
            throw new Error('Handle is required for Bluesky connection');
          }
          connectionData = await strategy(network, additionalData.handle);
          break;
        
        case 'account':
          if (!additionalData.username || !additionalData.pod) {
            throw new Error('Username and pod are required for Diaspora connection');
          }
          connectionData = await strategy(network, additionalData);
          break;
        
        default:
          throw new Error(`Unsupported authentication method: ${network.authentication_method}`);
      }

      return {
        network_id: networkId,
        network_name: network.name,
        connection_data: connectionData,
        connected_at: new Date().toISOString(),
        status: 'connected'
      };
    } catch (error) {
      console.error(`Failed to connect to ${network.name}:`, error);
      throw error;
    }
  },

  // Disconnect from a network
  async disconnectFromNetwork(networkId) {
    const network = this.getNetwork(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    // Perform any network-specific cleanup
    // This could include revoking tokens, clearing local storage, etc.
    
    return {
      network_id: networkId,
      disconnected_at: new Date().toISOString(),
      status: 'disconnected'
    };
  },

  // Test network connection
  async testConnection(networkId, connectionData) {
    const network = this.getNetwork(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    // In production, this would make actual API calls to test the connection
    // For now, we'll simulate a successful test
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          message: `Successfully connected to ${network.name}`,
          tested_at: new Date().toISOString()
        });
      }, 1000);
    });
  },

  // Get connection status
  getConnectionStatus(networkId, connectionData) {
    if (!connectionData) return 'disconnected';
    
    // Check if connection is still valid
    const connectedAt = new Date(connectionData.connected_at);
    const now = new Date();
    const hoursSinceConnection = (now - connectedAt) / (1000 * 60 * 60);
    
    // Consider connections older than 24 hours as potentially stale
    if (hoursSinceConnection > 24) {
      return 'stale';
    }
    
    return connectionData.status || 'connected';
  }
};

export default networkConnector;
