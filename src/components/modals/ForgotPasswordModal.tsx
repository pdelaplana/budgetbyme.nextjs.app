'use client';

import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FirebaseError } from 'firebase/app';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/authUtils';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');
  const [resetError, setResetError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setResetError('');

    try {
      await resetPassword(data.email);
      setEmailSentTo(data.email);
      setIsEmailSent(true);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setResetError(getAuthErrorMessage(firebaseError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsEmailSent(false);
    setEmailSentTo('');
    setResetError('');
    reset();
    onClose();
  };

  const handleResendEmail = () => {
    // TODO: Implement resend functionality
    console.log('Resend email to:', emailSentTo);
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
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all'>
                {/* Header */}
                <div className='flex items-center justify-between mb-4'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-semibold text-gray-900'
                  >
                    {isEmailSent ? 'Check your email' : 'Reset your password'}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className='text-gray-400 hover:text-gray-600 transition-colors duration-200'
                  >
                    <XMarkIcon className='h-5 w-5' />
                  </button>
                </div>

                {isEmailSent ? (
                  /* Success State */
                  <div className='space-y-4'>
                    <div className='flex items-center justify-center'>
                      <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-full'>
                        <CheckCircleIcon className='w-6 h-6 text-green-600' />
                      </div>
                    </div>
                    <div className='text-center space-y-2'>
                      <p className='text-sm text-gray-600'>
                        We've sent a password reset link to:
                      </p>
                      <p className='font-medium text-gray-900'>{emailSentTo}</p>
                      <p className='text-xs text-gray-500'>
                        Check your email and follow the instructions to reset
                        your password. If you don't see the email, check your
                        spam folder.
                      </p>
                    </div>

                    <div className='flex flex-col space-y-3 pt-4'>
                      <button
                        onClick={handleResendEmail}
                        className='w-full btn-secondary text-sm'
                      >
                        Resend email
                      </button>
                      <button
                        onClick={handleClose}
                        className='w-full btn-primary text-sm'
                      >
                        Back to sign in
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form State */
                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600'>
                        Enter your email address and we'll send you a link to
                        reset your password.
                      </p>
                    </div>

                    {/* Error Message */}
                    {resetError && (
                      <div className='rounded-md bg-red-50 border border-red-200 p-3'>
                        <div className='text-sm text-red-700'>{resetError}</div>
                      </div>
                    )}

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor='reset-email'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Email address
                      </label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address',
                          },
                        })}
                        type='email'
                        id='reset-email'
                        autoComplete='email'
                        className={`block w-full rounded-lg border px-3 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder='Enter your email'
                      />
                      {errors.email && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className='flex flex-col sm:flex-row-reverse gap-3 pt-4'>
                      <button
                        type='submit'
                        disabled={isLoading}
                        className='flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isLoading ? (
                          <div className='flex items-center justify-center'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Sending...
                          </div>
                        ) : (
                          'Send reset link'
                        )}
                      </button>
                      <button
                        type='button'
                        onClick={handleClose}
                        className='flex-1 btn-secondary text-sm'
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
