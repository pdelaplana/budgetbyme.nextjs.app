'use client'

import {
  CalendarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React, { useState } from 'react'

interface MarkAsPaidFormData {
  amount: string
  datePaid: string
  paymentMethod: string
  notes: string
  receipt: File | null
}

interface MarkAsPaidModalProps {
  isOpen: boolean
  onClose: () => void
  expenseId: string
  expenseName: string
  expenseAmount: number
  onMarkAsPaid?: (paymentData: {
    amount: number
    datePaid: string
    paymentMethod: string
    notes?: string
    receipt?: File
  }) => void
}

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Check',
  'Cash',
  'PayPal',
  'Venmo',
  'Zelle',
  'Wire Transfer',
  'Other',
]

export default function MarkAsPaidModal({
  isOpen,
  onClose,
  expenseId,
  expenseName,
  expenseAmount,
  onMarkAsPaid,
}: MarkAsPaidModalProps) {
  const [formData, setFormData] = useState<MarkAsPaidFormData>({
    amount: expenseAmount.toString(),
    datePaid: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: '',
    receipt: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleInputChange = (
    field: keyof MarkAsPaidFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, receipt: file }))
  }

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, receipt: null }))
    // Reset file input
    const fileInput = document.getElementById(
      'receipt-file',
    ) as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    } else if (Number(formData.amount) > expenseAmount * 1.1) {
      newErrors.amount = `Amount seems too high for this expense (${formatCurrency(expenseAmount)})`
    }

    if (!formData.datePaid) {
      newErrors.datePaid = 'Payment date is required'
    } else {
      const paymentDate = new Date(formData.datePaid)
      const today = new Date()
      if (paymentDate > today) {
        newErrors.datePaid = 'Payment date cannot be in the future'
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }

    // File size validation (5MB max)
    if (formData.receipt && formData.receipt.size > 5 * 1024 * 1024) {
      newErrors.receipt = 'File size must be less than 5MB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (onMarkAsPaid) {
        onMarkAsPaid({
          amount: Number(formData.amount),
          datePaid: formData.datePaid,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || undefined,
          receipt: formData.receipt || undefined,
        })
      }

      // Reset form and close modal
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error marking as paid:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: expenseAmount.toString(),
      datePaid: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      notes: '',
      receipt: null,
    })
    setErrors({})
    // Reset file input
    const fileInput = document.getElementById(
      'receipt-file',
    ) as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <CheckCircleIcon className="h-6 w-6 text-success-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Mark as Paid
                </h2>
                <p className="text-sm text-gray-600 truncate">{expenseName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Expense Summary */}
          <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-900 mb-1">
                {formatCurrency(expenseAmount)}
              </div>
              <div className="text-sm text-success-700">Expense Amount</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Amount Paid */}
              <div>
                <label htmlFor="amount-paid" className="form-label">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                  Amount Paid
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="amount-paid"
                    type="text"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange(
                        'amount',
                        e.target.value.replace(/[^0-9.]/g, ''),
                      )
                    }
                    placeholder="0.00"
                    className={`form-input pl-7 ${errors.amount ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                {Number(formData.amount) !== expenseAmount &&
                  Number(formData.amount) > 0 && (
                    <p className="mt-1 text-sm text-warning-600">
                      ⚠️ Amount differs from expense total (
                      {formatCurrency(expenseAmount)})
                    </p>
                  )}
              </div>

              {/* Date Paid */}
              <div>
                <label htmlFor="date-paid" className="form-label">
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  Date Paid
                </label>
                <input
                  id="date-paid"
                  type="date"
                  value={formData.datePaid}
                  onChange={(e) =>
                    handleInputChange('datePaid', e.target.value)
                  }
                  className={`form-input ${errors.datePaid ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.datePaid && (
                  <p className="mt-1 text-sm text-red-600">{errors.datePaid}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment-method" className="form-label">
                <CreditCardIcon className="h-4 w-4 inline mr-2" />
                Payment Method
              </label>
              <select
                id="payment-method"
                value={formData.paymentMethod}
                onChange={(e) =>
                  handleInputChange('paymentMethod', e.target.value)
                }
                className={`form-input ${errors.paymentMethod ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select payment method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="payment-notes" className="form-label">
                <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                Notes (Optional)
              </label>
              <textarea
                id="payment-notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this payment (confirmation number, partial payment reason, etc.)..."
                rows={3}
                className="form-input resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label htmlFor="receipt-file" className="form-label">
                <PaperClipIcon className="h-4 w-4 inline mr-2" />
                Receipt/Proof of Payment (Optional)
              </label>

              {!formData.receipt ? (
                <div className="mt-1">
                  <input
                    id="receipt-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="receipt-file"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <PaperClipIcon className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, PDF, DOC (max 5MB)
                  </p>
                </div>
              ) : (
                <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {formData.receipt.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(formData.receipt.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {errors.receipt && (
                <p className="mt-1 text-sm text-red-600">{errors.receipt}</p>
              )}
            </div>

            {/* Payment Guidelines */}
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-success-800 mb-2">
                Payment Recording Tips
              </h4>
              <ul className="text-sm text-success-700 space-y-1">
                <li>
                  • Record the actual amount paid (may differ from expense
                  total)
                </li>
                <li>• Use the date when payment was processed/cleared</li>
                <li>
                  • Upload receipts or confirmation screenshots for your records
                </li>
                <li>
                  • Add notes for confirmation numbers or special circumstances
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1 order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center"
              disabled={isSubmitting}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Recording Payment...' : 'Mark as Paid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
