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
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccountLayout from '@/components/layouts/AccountLayout';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';
import ExportDataModal from '@/components/modals/ExportDataModal';
import ReAuthModal from '@/components/modals/ReAuthModal';
import DisplayNameEditor from '@/components/profile/DisplayNameEditor';
import ProfilePhotoEditor from '@/components/profile/ProfilePhotoEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchUserWorkspace } from '@/hooks/queries/useFetchUserWorkspace';
import { formatDateLong, formatDateTime } from '@/lib/formatters';
import { setupUserWorkspace } from '@/server/actions/setupUserWorkspace';

export default function ProfilePage() {
  const { user, updateUserProfile, signOut } = useAuth();
  const isTestMode =
    process.env.NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE === 'true';

  const { data: userWorkspace } = useFetchUserWorkspace(user?.uid || '');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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

  const handleSignOutConfirm = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <ProtectedRoute>
      <AccountLayout>
        {/* Page Header */}
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
            Account Settings
          </h1>
          <p className='text-sm sm:text-base text-gray-600'>
            Manage your profile, security, and data preferences
          </p>
        </div>

        <div className='space-y-6'>
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
              <ProfilePhotoEditor user={user} hasPhoto={!!user?.photoURL} />

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
                    {user?.emailVerified && (
                      <ShieldCheckIcon
                        className='h-4 w-4 text-green-500'
                        title='Email verified'
                      />
                    )}
                  </div>
                  <span className='text-xs text-gray-500'>
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              {/* Member Since - Simplified */}
              <div className='pt-4 border-t'>
                <div className='text-center sm:text-left'>
                  <div className='text-sm text-gray-500'>Member Since</div>
                  <div className='text-sm font-medium text-gray-900'>
                    {user?.metadata?.creationTime
                      ? formatDateLong(new Date(user.metadata.creationTime))
                      : 'Recently'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className='card'>
            <div className='card-header'>
              <div className='flex items-center space-x-2'>
                <ShieldCheckIcon className='h-5 w-5 text-primary-600' />
                <h2 className='text-heading font-semibold text-gray-900'>
                  Privacy & Security
                </h2>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Password Management */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Password
                  </h3>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    Change your password to keep your account secure
                  </p>
                </div>
                <div className='flex-shrink-0 sm:ml-4'>
                  <button
                    type='button'
                    onClick={() => setShowChangePassword(true)}
                    className='btn-secondary profile-action-button'
                  >
                    <KeyIcon className='h-4 w-4 mr-2' />
                    Change Password
                  </button>
                </div>
              </div>

              {/* Login History */}
              <div className='pt-4 border-t'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>
                  Login Activity
                </h3>
                <div className='flex items-center space-x-2 text-xs text-gray-500'>
                  <ShieldCheckIcon className='h-4 w-4 text-green-500' />
                  <span>
                    Last sign in:{' '}
                    {user?.metadata?.lastSignInTime
                      ? formatDateTime(new Date(user.metadata.lastSignInTime))
                      : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data & Preferences Section */}
          <div className='card'>
            <div className='card-header'>
              <div className='flex items-center space-x-2'>
                <DocumentArrowDownIcon className='h-5 w-5 text-primary-600' />
                <h2 className='text-heading font-semibold text-gray-900'>
                  Data & Preferences
                </h2>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Data Export */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Export Your Data
                  </h3>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    Download a copy of all your events, expenses, and payments
                  </p>
                </div>
                <div className='flex-shrink-0 sm:ml-4'>
                  <button
                    type='button'
                    onClick={() => setShowExportData(true)}
                    className='btn-secondary profile-action-button'
                  >
                    <ArrowDownTrayIcon className='h-4 w-4 mr-2' />
                    Export Data
                  </button>
                </div>
              </div>

              {/* Workspace Status */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4 border-t'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Workspace Status
                  </h3>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    {hasWorkspace
                      ? 'Your workspace is configured and ready to use'
                      : 'Initialize your workspace with default settings'}
                  </p>
                </div>
                <div className='flex-shrink-0 sm:ml-4'>
                  {hasWorkspace ? (
                    <span className='profile-action-button bg-green-100 text-green-800 rounded-md'>
                      <ShieldCheckIcon className='h-4 w-4 mr-2' />
                      Active
                    </span>
                  ) : (
                    <button
                      type='button'
                      onClick={onSetupWorkspace}
                      disabled={isSettingUpWorkspace}
                      className='btn-primary profile-action-button disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <BuildingOfficeIcon className='h-4 w-4 mr-2' />
                      {isSettingUpWorkspace
                        ? 'Setting up...'
                        : 'Setup Workspace'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Management Section */}
          <div className='card'>
            <div className='card-header'>
              <div className='flex items-center space-x-2'>
                <ArrowRightOnRectangleIcon className='h-5 w-5 text-primary-600' />
                <h2 className='text-heading font-semibold text-gray-900'>
                  Account Management
                </h2>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Sign Out */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Sign Out
                  </h3>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    Sign out of your account on this device
                  </p>
                </div>
                <div className='flex-shrink-0 sm:ml-4'>
                  <button
                    type='button'
                    onClick={() => setShowSignOutConfirm(true)}
                    className='btn-secondary profile-action-button'
                  >
                    <ArrowRightOnRectangleIcon className='h-4 w-4 mr-2' />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className='card border-red-200 bg-red-50/30'>
            <div className='card-header border-red-200 bg-red-50'>
              <div className='flex items-center space-x-2'>
                <ExclamationTriangleIcon className='h-5 w-5 text-red-600' />
                <h2 className='text-heading font-semibold text-red-900'>
                  Danger Zone
                </h2>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Delete Account */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-red-900'>
                    Delete Account
                  </h3>
                  <p className='text-xs sm:text-sm text-red-700'>
                    Permanently delete your account and all associated data.
                    This requires password confirmation for security. You will
                    receive an email confirmation and be signed out immediately.
                  </p>
                  {isTestMode && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-2 mt-3'>
                      <p className='text-xs text-blue-700 font-medium'>
                        🧪 Test Mode Active: Experience the full workflow
                        without any actual deletion
                      </p>
                    </div>
                  )}
                </div>
                <div className='flex-shrink-0 sm:ml-4'>
                  <button
                    type='button'
                    onClick={() => setShowReAuthModal(true)}
                    className='btn-secondary profile-action-button border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800'
                  >
                    <TrashIcon className='h-4 w-4 mr-2' />
                    Delete Account
                  </button>
                </div>
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

        {/* Sign Out Confirmation Modal */}
        <ConfirmDialog
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={handleSignOutConfirm}
          title='Sign Out'
          message="Are you sure you want to sign out of your account? You'll need to sign in again to access your events and data."
          confirmText='Sign Out'
          cancelText='Cancel'
          type='info'
          isLoading={isSigningOut}
        />

        {/* Re-Authentication Modal for Delete Account */}
        <ReAuthModal
          isOpen={showReAuthModal}
          onClose={() => {
            setShowReAuthModal(false);
          }}
          onSuccess={() => {
            setShowReAuthModal(false);
            // Wait for modal to close before opening next one for better UX
            setTimeout(() => {
              setShowDeleteAccount(true);
            }, 150);
          }}
          onError={() => {
            /* Error handled within modal */
          }}
          title='Confirm Your Identity'
          description='Please enter your password to proceed with account deletion.'
        />

        <DeleteAccountModal
          isOpen={showDeleteAccount}
          onClose={() => setShowDeleteAccount(false)}
        />
      </AccountLayout>
    </ProtectedRoute>
  );
}
