import React from 'react';
import type { UserProfile } from '../../../infrastructure/api/ProfileApiService';

interface ProfileTabProps {
  profile: UserProfile | null;
  profileLoading: boolean;
  profileNotFound: boolean;
  formData: {
    name: string;
    favoriteGame: string;
  };
  saveLoading: boolean;
  saveError: string | null;
  isFormDirty: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  profileLoading,
  profileNotFound,
  formData,
  saveLoading,
  saveError,
  isFormDirty,
  onInputChange
}) => {
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {profileNotFound && (
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">ℹ️</span>
            <div>
              <p className="text-amber-400 font-medium">No Profile Information</p>
              <p className="text-amber-300 text-sm mt-1">
                No profile information has been saved. Fill out the form below to create your
                profile.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                formData.name.trim().length === 0 && isFormDirty
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-cyan-500'
              }`}
            />
            {formData.name.trim().length === 0 && isFormDirty && (
              <p className="text-red-400 text-sm mt-1">Name is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Favorite Game Title
            </label>
            <input
              type="text"
              value={formData.favoriteGame}
              onChange={(e) => onInputChange("favoriteGame", e.target.value)}
              placeholder="Enter your favorite game"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❌</span>
            <div>
              <p className="text-red-400 font-medium">Failed to Save Profile</p>
              <p className="text-red-300 text-sm mt-1">{saveError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};