'use client';

import {
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import ReactQueryDemo from '@/components/debug/ReactQueryDemo';
import AccountLayout from '@/components/layouts/AccountLayout';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';
import ExportDataModal from '@/components/modals/ExportDataModal';
import DisplayNameEditor from '@/components/profile/DisplayNameEditor';
import ProfilePhotoEditor from '@/components/profile/ProfilePhotoEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchUserWorkspace } from '@/hooks/queries/useFetchUserWorkspace';
import { setupUserWorkspace } from '@/server/actions/setupUserWorkspace';
import { Currency } from '@/types/currencies';
import { formatDateLong, formatDateTime } from '@/lib/formatters';

// Mock user data
const mockUser = {
  id: 'user-1',
  displayName: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  photoUrl: null, // Could be a URL to profile image
  joinedDate: '2024-01-15',
  lastSignIn: '2024-03-10T14:30:00Z',
  eventsCount: 5,
  totalBudget: 45000,
  emailVerified: true,
};

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const { data: userWorkspace } = useFetchUserWorkspace(user?.uid || '');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [isSettingUpWorkspace, setIsSettingUpWorkspace] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  useEffect(() => {
    if (userWorkspace) {
      setHasWorkspace(true);
    }
  }, [userWorkspace]);

  // Check if user already has a workspace
  // This would normally be done with a proper hook or API call
  // For now, we'll just check localStorage as a demo

  const onSetupWorkspace = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setIsSettingUpWorkspace(true);
    try {
      const workspaceData = {
        userId: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        preferences: {
          language: 'en',
          currency: 'USD',
        },
      };
      await setupUserWorkspace(workspaceData);
      setHasWorkspace(true);
      alert('Workspace setup completed successfully!');
    } catch {
      alert('Failed to setup workspace. Please try again.');
    } finally {
      setIsSettingUpWorkspace(false);
    }
  };

  const handleSignOut = () => {
    console.log('Sign out user');
    // In real app, this would call Firebase Auth signOut
  };


  return (
    <AccountLayout>
      {/* Page Header */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
          Your Account
        </h1>
        <p className='text-sm sm:text-base text-gray-600'>
          Manage your profile, security settings, and account preferences
        </p>
      </div>

      <div className='space-y-6 sm:space-y-8'>
        {/* Profile Information Section */}
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center space-x-2'>
              <UserIcon className='h-5 w-5 text-primary-600' />
              <h2 className='text-heading font-semibold text-gray-900'>
                Profile Information
              </h2>
            </div>
          </div>

          <div className='space-y-6'>
            {/* Profile Photo */}
            <ProfilePhotoEditor
              user={user}
              hasPhoto={mockUser.photoUrl !== null}
            />

            {/* Display Name */}
            <DisplayNameEditor
              user={user}
              onUpdateProfile={updateUserProfile}
            />

            {/* Email */}
            <div>
              <div className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm sm:text-base text-gray-900'>
                    {user?.email}
                  </span>
                  {mockUser.emailVerified && (
                    <ShieldCheckIcon
                      className='h-4 w-4 text-green-500'
                      title='Email verified'
                    />
                  )}
                </div>
                <span className='text-xs text-gray-500'>Verified</span>
              </div>
            </div>

            {/* Account Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t'>
              <div className='text-center sm:text-left'>
                <div className='text-lg font-semibold text-gray-900'>
                  {mockUser.eventsCount}
                </div>
                <div className='text-xs text-gray-500'>Events Created</div>
              </div>
              <div className='text-center sm:text-left'>
                <div className='text-lg font-semibold text-gray-900'>
                  ${mockUser.totalBudget.toLocaleString()}
                </div>
                <div className='text-xs text-gray-500'>Total Budget</div>
              </div>
              <div className='text-center sm:text-left'>
                <div className='text-lg font-semibold text-gray-900'>
                  {formatDateLong(new Date(mockUser.joinedDate))}
                </div>
                <div className='text-xs text-gray-500'>Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center space-x-2'>
              <KeyIcon className='h-5 w-5 text-primary-600' />
              <h2 className='text-heading font-semibold text-gray-900'>
                Security
              </h2>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
              <div>
                <h3 className='text-sm font-medium text-gray-900'>Password</h3>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Change your password to keep your account secure
                </p>
              </div>
              <button
                type='button'
                onClick={() => setShowChangePassword(true)}
                className='btn-secondary w-full sm:w-auto'
              >
                Change Password
              </button>
            </div>

            <div className='pt-4 border-t'>
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <ShieldCheckIcon className='h-4 w-4 text-green-500' />
                <span>Last sign in: {formatDateTime(new Date(mockUser.lastSignIn))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center space-x-2'>
              <DocumentArrowDownIcon className='h-5 w-5 text-primary-600' />
              <h2 className='text-heading font-semibold text-gray-900'>
                Data Management
              </h2>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
              <div>
                <h3 className='text-sm font-medium text-gray-900'>
                  Export Your Data
                </h3>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Download a copy of all your events, expenses, and payments
                </p>
              </div>
              <button
                type='button'
                onClick={() => setShowExportData(true)}
                className='btn-secondary w-full sm:w-auto flex items-center justify-center'
              >
                <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* React Query Demo Section */}
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center space-x-2'>
              <h2 className='text-heading font-semibold text-gray-900'>
                React Query DevTools Demo
              </h2>
            </div>
          </div>
          <ReactQueryDemo />
        </div>

        {/* Account Actions Section */}
        <div className='card'>
          <div className='card-header'>
            <div className='flex items-center space-x-2'>
              <ExclamationTriangleIcon className='h-5 w-5 text-red-600' />
              <h2 className='text-heading font-semibold text-gray-900'>
                Account Actions
              </h2>
            </div>
          </div>

          <div className='space-y-4'>
            {/* Setup Workspace */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b'>
              <div>
                <h3 className='text-sm font-medium text-gray-900'>
                  {hasWorkspace ? 'Workspace Status' : 'Setup Workspace'}
                </h3>
                <p className='text-xs sm:text-sm text-gray-500'>
                  {hasWorkspace
                    ? 'Your workspace is configured and ready to use'
                    : 'Initialize your user workspace with default settings'}
                </p>
              </div>
              {hasWorkspace ? (
                <div className='flex items-center text-green-600'>
                  <ShieldCheckIcon className='h-4 w-4 mr-2' />
                  <span className='text-sm font-medium'>Active</span>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={onSetupWorkspace}
                  disabled={isSettingUpWorkspace}
                  className='btn-primary w-full sm:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <BuildingOfficeIcon className='h-4 w-4 mr-2' />
                  {isSettingUpWorkspace ? 'Setting up...' : 'Setup Workspace'}
                </button>
              )}
            </div>

            {/* Sign Out */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b'>
              <div>
                <h3 className='text-sm font-medium text-gray-900'>Sign Out</h3>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Sign out of your account on this device
                </p>
              </div>
              <button
                type='button'
                onClick={handleSignOut}
                className='btn-secondary w-full sm:w-auto flex items-center justify-center'
              >
                <ArrowRightOnRectangleIcon className='h-4 w-4 mr-2' />
                Sign Out
              </button>
            </div>

            {/* Delete Account */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0'>
              <div>
                <h3 className='text-sm font-medium text-red-900'>
                  Delete Account
                </h3>
                <p className='text-xs sm:text-sm text-red-600'>
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setShowDeleteAccount(true)}
                className='btn-secondary border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto flex items-center justify-center'
              >
                <TrashIcon className='h-4 w-4 mr-2' />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <ExportDataModal
        isOpen={showExportData}
        onClose={() => setShowExportData(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </AccountLayout>
  );
}
