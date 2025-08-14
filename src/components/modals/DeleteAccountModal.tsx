'use client'

import { Dialog, Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React, { Fragment, useState } from 'react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<
    'warning' | 'confirm' | 'deleting' | 'completed'
  >('warning')
  const [confirmationText, setConfirmationText] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDeleting, setIsDeleting] = useState(false)

  const requiredText = 'DELETE MY ACCOUNT'

  const handleClose = () => {
    setStep('warning')
    setConfirmationText('')
    setPassword('')
    setErrors({})
    setIsDeleting(false)
    onClose()
  }

  const handleContinue = () => {
    setStep('confirm')
  }

  const handleConfirmDelete = async () => {
    const newErrors: Record<string, string> = {}

    if (confirmationText !== requiredText) {
      newErrors.confirmation = `Please type "${requiredText}" exactly as shown`
    }

    if (!password) {
      newErrors.password = 'Password is required to confirm account deletion'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsDeleting(true)
    setStep('deleting')

    try {
      // Simulate account deletion process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      console.log('Delete account confirmed:', { confirmationText, password })
      // In real app, this would:
      // 1. Re-authenticate user with password
      // 2. Delete all user data from Firestore
      // 3. Delete user files from Storage
      // 4. Delete the Firebase Auth user
      // 5. Sign out and redirect to landing page

      setStep('completed')

      // Auto redirect after showing success
      setTimeout(() => {
        // In real app, this would redirect to landing page
        console.log('Redirecting to landing page...')
        window.location.href = '/'
      }, 3000)
    } catch (error) {
      setErrors({
        submit:
          'Failed to delete account. Please check your password and try again.',
      })
      setStep('confirm')
      setIsDeleting(false)
    }
  }

  const renderWarningStep = () => (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          </div>
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Delete Your Account
          </Dialog.Title>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  This action cannot be undone
                </h3>
                <p className="text-sm text-red-700">
                  Deleting your account will permanently remove all your data
                  and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                What will be permanently deleted:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                  All your events and budgets (5 events, $45,000 total budget)
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                  All expenses, payments, and transaction history
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                  All uploaded receipts and documents
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                  Your profile and account settings
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                  Access to this account (sarah.johnson@example.com)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">
                    Before you delete your account
                  </h4>
                  <p className="text-sm text-blue-700">
                    Consider exporting your data first. You can download a
                    complete backup of all your information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleClose}
            className="btn-secondary w-full sm:w-auto"
          >
            Keep My Account
          </button>
          <button
            onClick={handleContinue}
            className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
          >
            Continue with Deletion
          </button>
        </div>
      </div>
    </>
  )

  const renderConfirmStep = () => (
    <>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
            <TrashIcon className="w-4 h-4 text-red-600" />
          </div>
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Confirm Account Deletion
          </Dialog.Title>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleConfirmDelete()
        }}
        className="p-6"
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Final confirmation required
                </h3>
                <p className="text-sm text-yellow-700">
                  Please complete the fields below to permanently delete your
                  account.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type{' '}
              <span className="font-mono font-bold text-red-600">
                "{requiredText}"
              </span>{' '}
              to confirm:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={`form-input ${errors.confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="Type the confirmation text"
              disabled={isDeleting}
            />
            {errors.confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmation}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="Enter your current password"
              disabled={isDeleting}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setStep('warning')}
            className="btn-secondary w-full sm:w-auto"
            disabled={isDeleting}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto font-medium"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting Account...
              </div>
            ) : (
              'Delete My Account Forever'
            )}
          </button>
        </div>
      </form>
    </>
  )

  const renderDeletingStep = () => (
    <div className="p-8 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <TrashIcon className="h-6 w-6 text-red-600" />
      </div>
      <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
        Deleting Your Account
      </Dialog.Title>
      <p className="text-sm text-gray-500 mb-6">
        Please wait while we permanently delete your account and all associated
        data...
      </p>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    </div>
  )

  const renderCompletedStep = () => (
    <div className="p-8 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
        Account Deleted Successfully
      </Dialog.Title>
      <p className="text-sm text-gray-500 mb-6">
        Your account and all associated data have been permanently deleted. You
        will be redirected to the home page.
      </p>
      <div className="animate-pulse text-sm text-gray-400">Redirecting...</div>
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 'warning':
        return renderWarningStep()
      case 'confirm':
        return renderConfirmStep()
      case 'deleting':
        return renderDeletingStep()
      case 'completed':
        return renderCompletedStep()
      default:
        return renderWarningStep()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={
          step === 'deleting' || step === 'completed' ? () => {} : handleClose
        }
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {renderStepContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
