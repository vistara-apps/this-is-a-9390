import axios from 'axios';

// Using a public Farcaster API endpoint for demo purposes
// In production, you would use Neynar API with proper authentication
const FARCASTER_API_BASE = 'https://api.farcaster.xyz/v2';

export const fetchFarcasterCasts = async (limit = 20) => {
  try {
    // Mock data for demo since we don't have Neynar API key
    // In production, this would be: await axios.get(`${NEYNAR_API_BASE}/casts`, { headers: { 'api_key': API_KEY } })
    
    const mockCasts = [
      {
        id: 'fc_1',
        network_id: 'farcaster',
        author_id: 'dan',
        content: 'Building the future of decentralized social networks! The composability of web3 social is incredible. 🚀',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        likes: 42,
        replies: 8,
        reposts: 15,
        external_url: 'https://warpcast.com/dan'
      },
      {
        id: 'fc_2',
        network_id: 'farcaster',
        author_id: 'vitalik',
        content: 'Interesting thoughts on crypto governance and the importance of credible neutrality in protocol design.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        likes: 156,
        replies: 23,
        reposts: 45,
        external_url: 'https://warpcast.com/vitalik.eth'
      },
      {
        id: 'fc_3',
        network_id: 'farcaster',
        author_id: 'jessepollak',
        content: 'Base is making onchain experiences so much smoother. The future is multichain and the UX is getting there! 🔵',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        likes: 89,
        replies: 12,
        reposts: 31,
        external_url: 'https://warpcast.com/jessepollak'
      },
      {
        id: 'fc_4',
        network_id: 'farcaster',
        author_id: 'balajis',
        content: 'The network state concept is becoming more real every day. Decentralized governance + crypto-native communities = 🌐',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        likes: 203,
        replies: 34,
        reposts: 67,
        external_url: 'https://warpcast.com/balajis'
      },
      {
        id: 'fc_5',
        network_id: 'farcaster',
        author_id: 'linda',
        content: 'Just shipped a new feature for our dApp! Love how fast we can iterate when building on solid infrastructure. GM builders! ☀️',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        likes: 67,
        replies: 9,
        reposts: 18,
        external_url: 'https://warpcast.com/linda'
      }
    ];

    return mockCasts;
  } catch (error) {
    console.error('Error fetching Farcaster casts:', error);
    return [];
  }
};

// Function for production use with actual Neynar API
export const fetchFarcasterCastsProduction = async (limit = 20) => {
  try {
    const response = await axios.get('https://api.neynar.com/v2/farcaster/feed', {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.REACT_APP_NEYNAR_API_KEY
      },
      params: {
        feed_type: 'following',
        limit: limit
      }
    });

    return response.data.casts.map(cast => ({
      id: cast.hash,
      network_id: 'farcaster',
      author_id: cast.author.username,
      content: cast.text,
      timestamp: cast.timestamp,
      likes: cast.reactions?.likes?.length || 0,
      replies: cast.replies?.count || 0,
      reposts: cast.reactions?.recasts?.length || 0,
      external_url: `https://warpcast.com/${cast.author.username}/${cast.hash}`
    }));
  } catch (error) {
    console.error('Error fetching Farcaster casts from Neynar:', error);
    return [];
  }
};