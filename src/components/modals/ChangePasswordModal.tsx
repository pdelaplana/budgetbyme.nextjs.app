'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { Fragment, useState } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (newPassword === currentPassword && newPassword) {
      newErrors.newPassword =
        'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Change password:', { currentPassword, newPassword });
      // In real app, this would call Firebase Auth reauthenticateWithCredential
      // and then updatePassword

      setIsSuccess(true);

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setErrors({
        submit:
          'Failed to change password. Please check your current password and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];

    return {
      strength,
      label: levels[strength - 1]?.label || '',
      color: levels[strength - 1]?.color || '',
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (isSuccess) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all'>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
                    <CheckCircleIcon className='h-6 w-6 text-green-600' />
                  </div>
                  <Dialog.Title className='text-lg font-semibold text-gray-900 mb-2'>
                    Password Changed Successfully
                  </Dialog.Title>
                  <p className='text-sm text-gray-500 mb-4'>
                    Your password has been updated. Please use your new password
                    for future sign-ins.
                  </p>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto'></div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg'>
                      <KeyIcon className='w-4 h-4 text-primary-600' />
                    </div>
                    <Dialog.Title className='text-lg font-semibold text-gray-900'>
                      Change Password
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1'
                  >
                    <XMarkIcon className='w-5 h-5' />
                  </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className='p-6'>
                  <div className='space-y-5'>
                    {/* Current Password */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Current Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`form-input pr-10 ${errors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                          placeholder='Enter your current password'
                          disabled={isSubmitting}
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className='h-4 w-4 text-gray-400' />
                          ) : (
                            <EyeIcon className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        New Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`form-input pr-10 ${errors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                          placeholder='Enter your new password'
                          disabled={isSubmitting}
                        />
                        <button
                          type='button'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className='h-4 w-4 text-gray-400' />
                          ) : (
                            <EyeIcon className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className='mt-2'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <div className='flex space-x-1 flex-1'>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full ${
                                    level <= passwordStrength.strength
                                      ? passwordStrength.color
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className='text-xs text-gray-500'>
                              {passwordStrength.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {errors.newPassword && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Confirm New Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                          placeholder='Confirm your new password'
                          disabled={isSubmitting}
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className='h-4 w-4 text-gray-400' />
                          ) : (
                            <EyeIcon className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                      <div className='rounded-md bg-red-50 border border-red-200 p-3'>
                        <p className='text-sm text-red-600'>{errors.submit}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='flex space-x-3 mt-6 pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='btn-secondary flex-1'
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn-primary flex-1'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className='flex items-center justify-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
