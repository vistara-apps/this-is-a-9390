import React, { useState } from 'react';
import { User, Settings, LogOut, Wallet, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDisconnect } from 'wagmi';
import Button from './ui/Button';
import Input from './ui/Input';

const UserProfile = ({ onClose }) => {
  const { user, signOut, updateProfile, isWalletConnected, walletAddress } = useAuth();
  const { disconnect } = useDisconnect();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.profile?.display_name || '',
    bio: user?.profile?.bio || '',
    twitter_handle: user?.profile?.twitter_handle || '',
    website: user?.profile?.website || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (isWalletConnected) {
        disconnect();
      }
      onClose?.();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">Profile</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              {user?.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-text-primary">
                {user?.profile?.display_name || 'Anonymous User'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Wallet className="w-4 h-4" />
                <span>{formatAddress(walletAddress)}</span>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-bg rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-text-primary">Subscription</span>
            </div>
            <div className="text-sm text-text-secondary">
              Free Tier • <button className="text-primary hover:underline">Upgrade to Pro</button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your display name"
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 bg-surface border border-gray-700 rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                rows={3}
              />
            </div>

            <Input
              label="Twitter Handle"
              value={formData.twitter_handle}
              onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
              disabled={!isEditing}
              placeholder="@username"
            />

            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      display_name: user?.profile?.display_name || '',
                      bio: user?.profile?.bio || '',
                      twitter_handle: user?.profile?.twitter_handle || '',
                      website: user?.profile?.website || ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
