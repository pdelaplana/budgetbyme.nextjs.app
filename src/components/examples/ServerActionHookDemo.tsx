/**
 * Example component demonstrating the new server action hooks
 * This shows different patterns for using useServerAction
 */

'use client';

import { useState } from 'react';
import { useServerAction, useSimpleServerAction } from '@/hooks/common';

// Mock server actions for demonstration
const mockUpdateUserProfile = async (data: { name: string; email: string }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (data.email === 'error@test.com') {
    throw new Error('Invalid email address');
  }

  return { success: true, message: 'Profile updated successfully' };
};

const mockSyncData = async (_userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (Math.random() < 0.3) {
    throw new Error('Sync failed - network error');
  }

  return {
    success: true,
    recordCount: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString(),
  };
};

export default function ServerActionHookDemo() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Simple server action hook usage
  const profileUpdate = useSimpleServerAction(
    mockUpdateUserProfile,
    'updateUserProfile',
  );

  // Advanced server action hook with retry logic
  const dataSync = useServerAction(mockSyncData, {
    actionName: 'syncData',
    retryCount: 2,
    retryDelay: 1000,
    enableLogging: true,
    enableSentry: true,
  });

  const handleProfileUpdate = async () => {
    const result = await profileUpdate.execute(formData);
    if (result?.success) {
      alert('Profile updated successfully!');
    }
  };

  const handleDataSync = async () => {
    const result = await dataSync.execute('user123');
    if (result?.success) {
      alert(`Synced ${result.recordCount} records!`);
    }
  };

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Server Action Hook Demo</h2>

      {/* Profile Update Section */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>
          Profile Update (Simple Hook)
        </h3>

        <div className='space-y-2 mb-3'>
          <input
            type='text'
            placeholder='Name'
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className='w-full p-2 border rounded'
          />
          <input
            type='email'
            placeholder='Email (try error@test.com for error demo)'
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className='w-full p-2 border rounded'
          />
        </div>

        {profileUpdate.error && (
          <div className='text-red-600 text-sm mb-2'>
            Error: {profileUpdate.error}
            <button
              type='button'
              onClick={profileUpdate.clearError}
              className='ml-2 text-xs underline'
            >
              Clear
            </button>
          </div>
        )}

        <button
          type='button'
          onClick={handleProfileUpdate}
          disabled={
            profileUpdate.isLoading || !formData.name || !formData.email
          }
          className='w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300'
        >
          {profileUpdate.isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>

      {/* Data Sync Section */}
      <div>
        <h3 className='text-lg font-semibold mb-2'>
          Data Sync (Advanced Hook with Retry)
        </h3>

        {dataSync.error && (
          <div className='text-red-600 text-sm mb-2'>
            Error: {dataSync.error}
            <button
              type='button'
              onClick={dataSync.clearError}
              className='ml-2 text-xs underline'
            >
              Clear
            </button>
          </div>
        )}

        {dataSync.lastResult && (
          <div className='text-green-600 text-sm mb-2'>
            Last sync: {dataSync.lastResult.recordCount} records at{' '}
            {new Date(dataSync.lastResult.timestamp).toLocaleTimeString()}
          </div>
        )}

        <button
          type='button'
          onClick={handleDataSync}
          disabled={dataSync.isLoading}
          className='w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-300'
        >
          {dataSync.isLoading ? 'Syncing... (with retry)' : 'Sync Data'}
        </button>
      </div>

      {/* Status Display */}
      <div className='mt-4 text-xs text-gray-500'>
        <div>
          Profile Update Loading: {profileUpdate.isLoading ? 'Yes' : 'No'}
        </div>
        <div>Data Sync Loading: {dataSync.isLoading ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
