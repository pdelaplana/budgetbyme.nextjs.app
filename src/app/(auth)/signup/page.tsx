'use client';

import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAuthErrorMessage,
  getPasswordStrength,
} from '@/lib/firebase/authUtils';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const watchPassword = watch('password', '');

  const passwordStrengthData = getPasswordStrength(watchPassword);
  const passwordChecks = [
    { label: 'At least 8 characters', test: watchPassword.length >= 8 },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(watchPassword) },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(watchPassword) },
    { label: 'Contains number', test: /\d/.test(watchPassword) },
    {
      label: 'Contains special character',
      test: /[^a-zA-Z0-9]/.test(watchPassword),
    },
  ];

  const getStrengthColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-blue-500';
    if (score >= 2) return 'bg-yellow-500';
    if (score >= 1) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 4) return 'Strong';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    if (score >= 1) return 'Weak';
    return 'Very Weak';
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setAuthError('');

    try {
      await signUp(data.email, data.password, data.fullName);
      router.push('/');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setAuthError(getAuthErrorMessage(firebaseError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setAuthError('');

    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      setAuthError(getAuthErrorMessage(firebaseError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Create your account
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Join BudgetByMe and start planning your perfect event
        </p>
      </div>

      {/* Error Message */}
      {authError && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <div className='text-sm text-red-700'>{authError}</div>
        </div>
      )}

      {/* Sign Up Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4 sm:space-y-5'
      >
        {/* Full Name Field */}
        <div>
          <label
            htmlFor='fullName'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Full name
          </label>
          <input
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            type='text'
            id='fullName'
            autoComplete='name'
            className={`block w-full rounded-lg border px-3 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder='Enter your full name'
          />
          {errors.fullName && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.fullName.message}
            </p>
          )}
        </div>

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
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='new-password'
              className={`block w-full rounded-lg border px-3 py-3 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Create a password'
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

          {/* Password Strength Indicator */}
          {watchPassword && (
            <div className='mt-2 space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500'>
                  Password strength:
                </span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrengthData.score >= 4
                      ? 'text-green-600'
                      : passwordStrengthData.score >= 3
                        ? 'text-blue-600'
                        : passwordStrengthData.score >= 2
                          ? 'text-yellow-600'
                          : 'text-red-600'
                  }`}
                >
                  {getStrengthLabel(passwordStrengthData.score)}
                </span>
              </div>
              <div className='flex space-x-1'>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      level <= passwordStrengthData.score
                        ? getStrengthColor(passwordStrengthData.score)
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className='grid grid-cols-1 gap-0.5 text-xs'>
                {passwordChecks.map((check, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    {check.test ? (
                      <CheckCircleIcon className='h-3 w-3 text-green-500' />
                    ) : (
                      <XCircleIcon className='h-3 w-3 text-gray-300' />
                    )}
                    <span
                      className={
                        check.test ? 'text-green-600' : 'text-gray-500'
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Confirm password
          </label>
          <div className='relative'>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watchPassword || 'Passwords do not match',
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmPassword'
              autoComplete='new-password'
              className={`block w-full rounded-lg border px-3 py-3 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Confirm your password'
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 flex items-center pr-3'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
              ) : (
                <EyeIcon className='h-5 w-5 text-gray-400 hover:text-gray-600' />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className='flex items-start'>
            <input
              {...register('acceptTerms', {
                required: 'You must accept the terms and conditions',
              })}
              id='acceptTerms'
              type='checkbox'
              className='mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500'
            />
            <label htmlFor='acceptTerms' className='ml-3 text-sm text-gray-600'>
              I agree to the{' '}
              <a
                href='#'
                className='text-primary-600 hover:text-primary-500 font-medium'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='#'
                className='text-primary-600 hover:text-primary-500 font-medium'
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isLoading}
          className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
        >
          {isLoading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/signin')}
            className='font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200'
          >
            Sign in here
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

      {/* Social Sign Up Options */}
      <div className='grid grid-cols-1 gap-3'>
        <button
          type='button'
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className='w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
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
