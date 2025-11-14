'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/authUtils';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');
  const [resetError, setResetError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const handleBackToSignIn = () => {
    router.push('/signin');
  };

  const handleResendEmail = () => {
    // TODO: Implement resend functionality
    console.log('Resend email to:', emailSentTo);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900'>
          {isEmailSent ? 'Check your email' : 'Reset Your Password'}
        </h1>
        <p className='mt-2 text-sm text-gray-600'>
          {isEmailSent
            ? "We've sent you a reset link"
            : "Enter your email address and we'll send you a link to reset your password"}
        </p>
      </div>

      {isEmailSent ? (
        /* Success State */
        <div className='space-y-6 max-w-md mx-auto'>
          <div className='flex items-center justify-center'>
            <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-full'>
              <CheckCircleIcon className='w-6 h-6 text-green-600' />
            </div>
          </div>

          <div className='text-center space-y-3'>
            <p className='text-sm text-gray-600'>
              We've sent a password reset link to:
            </p>
            <p className='font-medium text-gray-900'>{emailSentTo}</p>
            <p className='text-xs text-gray-500'>
              Check your email and follow the instructions to reset your
              password. If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className='flex flex-col space-y-3'>
            <button
              type='button'
              onClick={handleResendEmail}
              className='w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200'
            >
              Resend email
            </button>
            <button
              type='button'
              onClick={handleBackToSignIn}
              className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200'
            >
              Back to sign in
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className='space-y-5 max-w-md mx-auto'>
          {/* Back to Sign In Link - Only in Form State */}
          <div className='text-center'>
            <button
              type='button'
              onClick={handleBackToSignIn}
              className='text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200'
            >
              ← Back to Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {/* Error Message */}
            {resetError && (
              <div className='rounded-md bg-red-50 border border-red-200 p-4'>
                <div className='text-sm text-red-700'>{resetError}</div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
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
                id='email'
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

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            >
              <div className='flex items-center'>
                {isLoading && (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                )}
                {isLoading ? 'Sending...' : 'Send reset link'}
              </div>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
