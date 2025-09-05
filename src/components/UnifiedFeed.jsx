import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, TrendingUp } from 'lucide-react';
import PostCard from './PostCard';
import Button from './ui/Button';
import { useNetwork } from '../contexts/NetworkContext';
import { fetchFarcasterCasts } from '../services/farcasterApi';

const UnifiedFeed = () => {
  const { connectedNetworks } = useNetwork();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPosts();
  }, [connectedNetworks]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let allPosts = [];
      
      // Load posts from connected networks
      if (connectedNetworks.find(n => n.id === 'farcaster')) {
        const farcasterPosts = await fetchFarcasterCasts();
        allPosts = [...allPosts, ...farcasterPosts];
      }
      
      // Sort by timestamp (newest first)
      allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.network_id === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Unified Feed</h1>
          <p className="text-text-secondary">
            Aggregated posts from {connectedNetworks.length} connected network{connectedNetworks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadPosts}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connected Networks Info */}
      {connectedNetworks.length > 0 && (
        <div className="bg-surface rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-text-primary">Connected Networks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedNetworks.map((network) => (
              <span
                key={network.id}
                className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md"
              >
                {network.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {connectedNetworks.length > 1 && (
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-text-secondary" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              All Networks
            </button>
            {connectedNetworks.map((network) => (
              <button
                key={network.id}
                onClick={() => setFilter(network.id)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === network.id
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {connectedNetworks.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-surface rounded-lg p-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Networks Connected
            </h3>
            <p className="text-text-secondary mb-4">
              Connect to networks in the Network Directory to see aggregated posts here.
            </p>
            <Button variant="primary">
              Browse Networks
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-lg p-6 border border-gray-700 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {filteredPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                No posts found for the selected filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedFeed;