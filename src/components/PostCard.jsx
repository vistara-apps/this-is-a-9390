import React from 'react';
import { Heart, MessageCircle, Repeat2, ExternalLink } from 'lucide-react';

const PostCard = ({ post }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getNetworkColor = (networkId) => {
    switch (networkId) {
      case 'farcaster':
        return 'text-purple-400';
      case 'lens':
        return 'text-green-400';
      default:
        return 'text-accent';
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {post.author_id.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-text-primary">@{post.author_id}</p>
              <span className={`text-xs px-2 py-1 rounded-md bg-gray-800 ${getNetworkColor(post.network_id)}`}>
                {post.network_id}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {formatTimeAgo(post.timestamp)}
            </p>
          </div>
        </div>
        
        {post.external_url && (
          <button
            onClick={() => window.open(post.external_url, '_blank')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-text-primary leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6 text-text-secondary">
        <button className="flex items-center space-x-2 hover:text-red-400 transition-colors">
          <Heart className="w-4 h-4" />
          <span className="text-sm">{post.likes || 0}</span>
        </button>
        
        <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{post.replies || 0}</span>
        </button>
        
        <button className="flex items-center space-x-2 hover:text-green-400 transition-colors">
          <Repeat2 className="w-4 h-4" />
          <span className="text-sm">{post.reposts || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;