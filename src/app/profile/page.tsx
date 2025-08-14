'use client'

import {
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import type React from 'react'
import { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AccountLayout from '@/components/layouts/AccountLayout'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal'
import DeleteAccountModal from '@/components/modals/DeleteAccountModal'
import ExportDataModal from '@/components/modals/ExportDataModal'
import { useAuth } from '@/contexts/AuthContext'

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
}

export default function ProfilePage() {
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(mockUser.displayName)
  const [tempDisplayName, setTempDisplayName] = useState(mockUser.displayName)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showExportData, setShowExportData] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleSaveName = () => {
    setDisplayName(tempDisplayName)
    setIsEditingName(false)
    console.log('Update display name:', tempDisplayName)
    // In real app, this would call the API
  }

  const handleCancelEditName = () => {
    setTempDisplayName(displayName)
    setIsEditingName(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false)
        console.log('Photo uploaded:', file.name)
        // In real app, this would upload to Firebase Storage
      }, 2000)
    }
  }

  const handleSignOut = () => {
    console.log('Sign out user')
    // In real app, this would call Firebase Auth signOut
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Your Account
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your profile, security settings, and account preferences
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Profile Information Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-heading font-semibold text-gray-900">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {mockUser.photoUrl ? (
                      <img
                        src={mockUser.photoUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Profile Photo
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  Upload a photo to personalize your account
                </p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <label className="btn-secondary cursor-pointer flex items-center justify-center">
                    <CameraIcon className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                  </label>
                  {mockUser.photoUrl && (
                    <button className="btn-secondary text-red-600 hover:text-red-700">
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditingName ? (
                <div className="flex flex-col xs:flex-row gap-2">
                  <input
                    type="text"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    className="form-input flex-1"
                    placeholder="Enter your display name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      className="btn-primary px-4"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      className="btn-secondary px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-sm sm:text-base text-gray-900">
                    {displayName}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-primary-600 hover:text-primary-700 p-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base text-gray-900">
                    {mockUser.email}
                  </span>
                  {mockUser.emailVerified && (
                    <ShieldCheckIcon
                      className="h-4 w-4 text-green-500"
                      title="Email verified"
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500">Verified</span>
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-gray-900">
                  {mockUser.eventsCount}
                </div>
                <div className="text-xs text-gray-500">Events Created</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-gray-900">
                  ${mockUser.totalBudget.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Total Budget</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(mockUser.joinedDate)}
                </div>
                <div className="text-xs text-gray-500">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <KeyIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-heading font-semibold text-gray-900">
                Security
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Change your password to keep your account secure
                </p>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="btn-secondary w-full sm:w-auto"
              >
                Change Password
              </button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                <span>Last sign in: {formatDateTime(mockUser.lastSignIn)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <DocumentArrowDownIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-heading font-semibold text-gray-900">
                Data Management
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Export Your Data
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Download a copy of all your events, expenses, and payments
                </p>
              </div>
              <button
                onClick={() => setShowExportData(true)}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h2 className="text-heading font-semibold text-gray-900">
                Account Actions
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sign Out */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Sign Out</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Sign out of your account on this device
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-red-900">
                  Delete Account
                </h3>
                <p className="text-xs sm:text-sm text-red-600">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto flex items-center justify-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
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
  )
}
