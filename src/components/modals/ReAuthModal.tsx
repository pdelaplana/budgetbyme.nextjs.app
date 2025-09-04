'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { signInWithEmailAndPassword } from 'firebase/auth';
import type React from 'react';
import { Fragment, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  title: string;
  description: string;
}

export default function ReAuthModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  title,
  description,
}: ReAuthModalProps) {
  const { user } = useAuth();
  const isTestMode = process.env.NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE === 'true';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setIsAuthenticating(false);
    setLocalError(null);
    onClose();
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password if forgotten.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait 10 minutes and try again, or reset your password.';
      case 'auth/user-not-found':
        return 'User account not found.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your password and try again.';
      default:
        return 'Authentication failed. Please check your password and try again.';
    }
  };

  const handleReAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setLocalError('Password is required');
      return;
    }

    if (!user?.email) {
      setLocalError('User email not found');
      return;
    }

    setIsAuthenticating(true);
    setLocalError(null);

    try {
      if (isTestMode) {
        // Simulate authentication in test mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('🧪 TEST MODE: Authentication simulated successfully');
        
        // Always succeed in test mode
        onSuccess();
        handleClose();
      } else {
        // Re-authenticate user with their email and password
        await signInWithEmailAndPassword(auth, user.email, password);
        
        // Success - call the onSuccess callback
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      if (!isTestMode) {
        const errorMessage = getFirebaseErrorMessage(error.code);
        setLocalError(errorMessage);
        onError(errorMessage);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

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
              <Dialog.Panel className='w-full max-w-md mx-4 transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg'>
                      <ShieldCheckIcon className='w-4 h-4 text-primary-600' />
                    </div>
                    <Dialog.Title className='text-lg font-semibold text-gray-900'>
                      {title}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1'
                    disabled={isAuthenticating}
                  >
                    <XMarkIcon className='w-5 h-5' />
                  </button>
                </div>

                {/* Content */}
                <form onSubmit={handleReAuthenticate} className='p-6'>
                  <div className='space-y-5'>
                    {/* Security Context */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                      <div className='flex items-start'>
                        <ShieldCheckIcon className='h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0' />
                        <p className='text-xs text-blue-700'>
                          For your security, we require password confirmation for account deletion.
                        </p>
                      </div>
                    </div>
                    {/* Description */}
                    <p className='text-sm text-gray-600'>{description}</p>

                    {/* Email (Read-only) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        value={user?.email || ''}
                        disabled
                        className='form-input bg-gray-50 text-gray-500 cursor-not-allowed'
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Password
                      </label>
                      <div className='relative'>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`form-input pr-10 ${localError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                          placeholder='Enter your password'
                          disabled={isAuthenticating}
                          autoFocus
                          autoComplete='current-password'
                          autoCapitalize='none'
                          autoCorrect='off'
                          spellCheck='false'
                          inputMode='text'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute inset-y-0 right-0 pr-3 flex items-center'
                          disabled={isAuthenticating}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className='h-4 w-4 text-gray-400' />
                          ) : (
                            <EyeIcon className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                      </div>
                      {localError && (
                        <>
                          <p className='mt-1 text-sm text-red-600'>{localError}</p>
                          {localError.includes('password') && (
                            <p className='mt-1 text-xs text-gray-500'>
                              Having trouble? You can change your password in the Security section above.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* ARIA live region for screen readers */}
                  <div
                    aria-live='polite'
                    aria-atomic='true'
                    className='sr-only'
                  >
                    {isAuthenticating && 'Verifying your password...'}
                    {localError && `Error: ${localError}`}
                  </div>

                  {/* Actions */}
                  <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='btn-secondary flex-1'
                      disabled={isAuthenticating}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn-primary flex-1 min-w-[120px] inline-flex items-center justify-center'
                      disabled={isAuthenticating || !password.trim()}
                    >
                      {isAuthenticating ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Verifying...
                        </>
                      ) : (
                        'Confirm Identity'
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