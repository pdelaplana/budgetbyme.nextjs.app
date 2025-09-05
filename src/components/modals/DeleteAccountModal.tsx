'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { Fragment, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount } from '@/server/actions/jobs/deleteAccount';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const { user } = useAuth();
  const isTestMode =
    process.env.NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE === 'true';
  const [step, setStep] = useState<
    'warning' | 'confirm' | 'deleting' | 'completed'
  >('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const requiredText = 'DELETE MY ACCOUNT';

  const handleClose = () => {
    setStep('warning');
    setConfirmationText('');
    setErrors({});
    setIsDeleting(false);
    onClose();
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleConfirmDelete = async () => {
    const newErrors: Record<string, string> = {};

    if (confirmationText !== requiredText) {
      newErrors.confirmation = `Please type "${requiredText}" exactly as shown`;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsDeleting(true);
    setStep('deleting');

    try {
      if (isTestMode) {
        // Simulate account deletion process in test mode
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('🧪 TEST MODE: Account deletion simulated successfully');
      } else {
        // User is already authenticated, just call server action
        await deleteAccount(user?.uid || '');
      }

      setStep('completed');

      // Sign out user after showing confirmation
      setTimeout(async () => {
        if (isTestMode) {
          console.log(
            '🧪 TEST MODE: Account deletion simulated - performing real sign-out',
          );
        }
        await signOut(auth);
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      setErrors({
        submit: 'Failed to delete account. Please try again.',
      });
      setStep('confirm');
      setIsDeleting(false);
    }
  };

  const renderWarningStep = () => (
    <>
      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
        <div className='flex items-center space-x-3'>
          <div className='flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg'>
            <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
          </div>
          <Dialog.Title className='text-lg font-semibold text-gray-900'>
            Delete Your Account
          </Dialog.Title>
        </div>
        <button
          onClick={handleClose}
          className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      </div>

      <div className='p-6'>
        <div className='mb-6'>
          <div className='rounded-lg bg-red-50 border border-red-200 p-4 mb-4'>
            <div className='flex'>
              <ExclamationTriangleIcon className='h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <h3 className='text-sm font-semibold text-red-800 mb-2'>
                  This action cannot be undone
                </h3>
                <p className='text-sm text-red-700 break-words mb-4'>
                  Deleting your account will permanently remove all your data
                  and cannot be recovered.
                </p>

                <div>
                  <h4 className='text-sm font-semibold text-red-800 mb-2'>
                    What will be permanently deleted:
                  </h4>
                  <ul className='text-sm text-red-700 space-y-1'>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0'></div>
                      All your events and budgets
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0'></div>
                      All expenses, payments, and transaction history
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0'></div>
                      All uploaded receipts and documents
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0'></div>
                      Your profile and account settings
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0'></div>
                      Access to this account
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex'>
                <ExclamationTriangleIcon className='h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0' />
                <div className='min-w-0 flex-1'>
                  <h4 className='text-sm font-semibold text-blue-800 mb-1'>
                    What happens next
                  </h4>
                  <p className='text-sm text-blue-700 break-words'>
                    After confirmation, your account deletion will begin
                    immediately. You'll receive a confirmation email at{' '}
                    <strong className='break-all'>{user?.email}</strong> within
                    5 minutes and be signed out of all devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button onClick={handleClose} className='btn-secondary flex-1'>
            Keep My Account
          </button>
          <button
            onClick={handleContinue}
            className='btn-secondary border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1'
          >
            Continue with Deletion
          </button>
        </div>
      </div>
    </>
  );

  const renderConfirmStep = () => (
    <>
      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
        <div className='flex items-center space-x-3'>
          <div className='flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg'>
            <TrashIcon className='w-4 h-4 text-red-600' />
          </div>
          <Dialog.Title className='text-lg font-semibold text-gray-900'>
            Confirm Account Deletion
          </Dialog.Title>
        </div>
        <button
          onClick={handleClose}
          className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmDelete();
        }}
        className='p-6'
      >
        <div className='space-y-5'>
          <div className='rounded-lg bg-yellow-50 border border-yellow-200 p-4'>
            <div className='flex'>
              <ExclamationTriangleIcon className='h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0' />
              <div>
                <h3 className='text-sm font-semibold text-yellow-800 mb-1'>
                  Final confirmation required
                </h3>
                <p className='text-sm text-yellow-700'>
                  Please complete the fields below to permanently delete your
                  account.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Type{' '}
              <span className='font-mono font-bold text-red-600'>
                "{requiredText}"
              </span>{' '}
              to confirm:
            </label>
            <input
              type='text'
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={`form-input ${errors.confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder='Type the confirmation text'
              disabled={isDeleting}
            />
            {errors.confirmation && (
              <p className='mt-1 text-sm text-red-600'>{errors.confirmation}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className='rounded-md bg-red-50 border border-red-200 p-3'>
              <p className='text-sm text-red-600'>{errors.submit}</p>
            </div>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={() => setStep('warning')}
            className='btn-secondary flex-[1]'
            disabled={isDeleting}
          >
            Back
          </button>
          <button
            type='submit'
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center flex-[2]'
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Deleting Account...
              </div>
            ) : (
              'Delete My Account Forever'
            )}
          </button>
        </div>
      </form>
    </>
  );

  const renderDeletingStep = () => (
    <div className='p-8 text-center'>
      <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
        <TrashIcon className='h-6 w-6 text-red-600' />
      </div>
      <Dialog.Title className='text-lg font-semibold text-gray-900 mb-2'>
        Deleting Your Account
      </Dialog.Title>
      <p className='text-sm text-gray-500 mb-6'>
        Please wait while we permanently delete your account and all associated
        data...
      </p>
      <div className='flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600'></div>
      </div>
    </div>
  );

  const renderCompletedStep = () => (
    <div className='p-8 text-center'>
      <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
        <CheckCircleIcon className='h-6 w-6 text-green-600' />
      </div>
      <Dialog.Title className='text-lg font-semibold text-gray-900 mb-2'>
        Account Deletion Initiated
      </Dialog.Title>
      <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-4'>
        <p className='text-sm text-green-700'>
          🔒 Secure deletion initiated - Your data is being permanently removed
          using industry-standard practices.
        </p>
      </div>
      <div className='space-y-3 text-sm text-gray-600 mb-6'>
        <p>Your account deletion has been initiated and cannot be stopped.</p>
        <p>
          Check your email at <strong>{user?.email}</strong> for confirmation
          details.
        </p>
        <p>
          If you change your mind, create a new account with the same email
          within 30 days.
        </p>
        <p>You are being signed out of all devices...</p>
      </div>
      <div className='animate-pulse text-sm text-gray-400'>
        Signing out in 3 seconds...
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'warning':
        return renderWarningStep();
      case 'confirm':
        return renderConfirmStep();
      case 'deleting':
        return renderDeletingStep();
      case 'completed':
        return renderCompletedStep();
      default:
        return renderWarningStep();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-50'
        onClose={
          step === 'deleting' || step === 'completed' ? () => {} : handleClose
        }
      >
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
              <Dialog.Panel className='w-full max-w-lg mx-4 transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all'>
                {renderStepContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
