'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface DisplayNameEditorProps {
  user: User | null;
  onUpdateProfile: (profile: { displayName: string }) => Promise<void>;
}

export default function DisplayNameEditor({
  user,
  onUpdateProfile,
}: DisplayNameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName);
  const [tempDisplayName, setTempDisplayName] = useState(
    user?.displayName || '',
  );

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setTempDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!tempDisplayName?.trim()) {
      return;
    }

    try {
      await onUpdateProfile({ displayName: tempDisplayName });
      setDisplayName(tempDisplayName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update display name:', error);
      // In a real app, you might want to show an error message to the user
    }
  };

  const handleCancelEditName = () => {
    setTempDisplayName(displayName || '');
    setIsEditingName(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveName();
    } else if (event.key === 'Escape') {
      handleCancelEditName();
    }
  };

  return (
    <div>
      <label
        htmlFor='display-name-input'
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        Display Name
      </label>
      {isEditingName ? (
        <div className='flex flex-col xs:flex-row gap-2'>
          <input
            id='display-name-input'
            type='text'
            value={tempDisplayName || ''}
            onChange={(e) => setTempDisplayName(e.target.value)}
            onKeyDown={handleKeyDown}
            className='form-input flex-1'
            placeholder='Enter your display name'
          />
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleSaveName}
              disabled={!tempDisplayName?.trim()}
              className='btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Save
            </button>
            <button
              type='button'
              onClick={handleCancelEditName}
              className='btn-secondary px-4'
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
          <span className='text-sm sm:text-base text-gray-900'>
            {user?.displayName || 'No display name set'}
          </span>
          <button
            type='button'
            onClick={() => setIsEditingName(true)}
            className='text-primary-600 hover:text-primary-700 p-1'
            aria-label='Edit display name'
          >
            <PencilIcon className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
