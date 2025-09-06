'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/authUtils';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setAuthError('');

    try {
      await signIn(data.email, data.password);
      router.push('/');
      // Keep loading state active until navigation completes
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setAuthError(getAuthErrorMessage(firebaseError));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      await signInWithGoogle();
      router.push('/');
      // Keep loading state active until navigation completes
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setAuthError(getAuthErrorMessage(firebaseError));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className='space-y-3 sm:space-y-5'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>Welcome back</h2>
        <p className='mt-1.5 text-sm text-gray-600'>
          Sign in to your account to continue planning
        </p>
      </div>

      {/* Error Message */}
      {authError && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <div className='text-sm text-red-700'>{authError}</div>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 sm:space-y-4'>
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
            <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Password
          </label>
          <div className='relative'>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='current-password'
              className={`block w-full rounded-lg border px-3 py-3 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter your password'
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 flex items-center pr-3'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
              ) : (
                <EyeIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
              )}
            </button>
          </div>
          {errors.password && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className='text-right'>
          <button
            type='button'
            onClick={handleForgotPassword}
            className='text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200'
          >
            Forgot your password?
          </button>
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </div>
        </button>
      </form>

      {/* Sign Up Link */}
      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          Don't have an account?{' '}
          <button
            type='button'
            onClick={() => router.push('/signup')}
            className='font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200'
          >
            Sign up for free
          </button>
        </p>
      </div>

      {/* Divider */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-300' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>Or continue with</span>
        </div>
      </div>

      {/* Social Sign In Options */}
      <div className='grid grid-cols-1 gap-3'>
        <button
          type='button'
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className='w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <svg
            className='h-5 w-5 mr-2'
            viewBox='0 0 24 24'
            aria-label='Google logo'
          >
            <title>Google logo</title>
            <path
              fill='currentColor'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='currentColor'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='currentColor'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='currentColor'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
