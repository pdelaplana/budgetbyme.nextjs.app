'use client'

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PhotoIcon,
  TagIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React from 'react'

interface ExpenseDetail {
  id: string
  name: string
  amount: number
  category: string
  categoryColor: string
  date: string
  description?: string
  receiptUrl?: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  isPaid?: boolean
  paidDate?: string
  paymentMethod?: string
  dueDate?: string
}

interface ExpenseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  expense: ExpenseDetail | null
  onEdit?: (expense: ExpenseDetail) => void
  onDelete?: (expenseId: string) => void
}

export default function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
}: ExpenseDetailModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
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
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Venue & Reception': '🏛️',
      'Catering & Beverages': '🍰',
      'Photography & Video': '📸',
      Attire: '👗',
      'Flowers & Decorations': '💐',
      'Music & Entertainment': '🎵',
    }
    return icons[category] || '🎉'
  }

  const handleEdit = () => {
    if (expense && onEdit) {
      onEdit(expense)
    }
  }

  const handleDelete = () => {
    if (expense && onDelete) {
      if (
        window.confirm(
          'Are you sure you want to delete this expense? This action cannot be undone.',
        )
      ) {
        onDelete(expense.id)
        onClose()
      }
    }
  }

  if (!isOpen || !expense) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {getCategoryIcon(expense.category)}
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Expense Details
                </h2>
                <p className="text-sm text-gray-600">{expense.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
          <div className="space-y-6">
            {/* Amount Card */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mr-2" />
                <span className="text-3xl sm:text-4xl font-bold text-primary-900">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              <p className="text-primary-700 font-medium">Total Amount</p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Expense Name
                  </label>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {expense.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </label>
                  <div className="mt-1 flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: expense.categoryColor }}
                    />
                    <p className="text-base font-medium text-gray-900">
                      {expense.category}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-base text-gray-900">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Amount
                  </label>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {expense.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {expense.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {expense.tags && expense.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expense.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Receipt */}
            {expense.receiptUrl && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Receipt
                </h3>
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      View Receipt
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Click to open in new tab
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Information
              </h3>

              {expense.isPaid ? (
                <div className="flex items-start space-x-4 p-4 bg-success-50 rounded-lg border border-success-200">
                  <CheckCircleIcon className="h-6 w-6 text-success-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-success-800">
                        Payment Completed
                      </span>
                      <span className="text-sm text-success-700 font-medium">
                        {formatDate(expense.paidDate!)}
                      </span>
                    </div>
                    {expense.paymentMethod && (
                      <p className="text-sm text-success-700">
                        Payment method:{' '}
                        <span className="font-medium">
                          {expense.paymentMethod}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ClockIcon className="h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-700">
                        Payment Pending
                      </span>
                      {expense.dueDate && (
                        <div className="mt-1">
                          <span className="text-sm text-gray-600">
                            Due date:{' '}
                            <span className="font-medium">
                              {formatDate(expense.dueDate)}
                            </span>
                          </span>
                          {(() => {
                            const today = new Date()
                            const dueDate = new Date(expense.dueDate)
                            const daysUntilDue = Math.ceil(
                              (dueDate.getTime() - today.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )

                            if (daysUntilDue < 0) {
                              return (
                                <div className="flex items-center mt-2 text-red-600">
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">
                                    {Math.abs(daysUntilDue)} days overdue
                                  </span>
                                </div>
                              )
                            } else if (daysUntilDue <= 7) {
                              return (
                                <div className="flex items-center mt-2 text-warning-600">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  <span className="text-sm font-medium">
                                    Due in {daysUntilDue} day
                                    {daysUntilDue !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Record Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDateTime(expense.createdAt)}
                  </p>
                </div>

                {expense.updatedAt && (
                  <div>
                    <label className="font-medium text-gray-500 uppercase tracking-wide">
                      Last Updated
                    </label>
                    <p className="mt-1 text-gray-900">
                      {formatDateTime(expense.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 py-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 order-3 sm:order-1"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="btn-secondary flex-1 order-1 sm:order-2 flex items-center justify-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 flex-1 order-2 sm:order-3 flex items-center justify-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
