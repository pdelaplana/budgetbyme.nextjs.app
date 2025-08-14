'use client'

import { Dialog, Transition } from '@headlessui/react'
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React, { Fragment, useState } from 'react'

interface ExportDataModalProps {
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'json' | 'csv' | 'pdf'
type ExportStatus = 'idle' | 'preparing' | 'ready' | 'downloading' | 'completed'

export default function ExportDataModal({
  isOpen,
  onClose,
}: ExportDataModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [includeImages, setIncludeImages] = useState(true)
  const [dateRange, setDateRange] = useState('all')
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState(0)

  const formatOptions = [
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Complete data with full structure, ideal for backup',
      fileSize: '~2.5 MB',
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Spreadsheet format, easy to import into Excel',
      fileSize: '~1.8 MB',
    },
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Formatted report with charts and summaries',
      fileSize: '~5.2 MB',
    },
  ]

  const dateRangeOptions = [
    { id: 'all', name: 'All Time', description: 'Export all your data' },
    {
      id: 'year',
      name: 'This Year',
      description: 'Events and expenses from this year',
    },
    {
      id: 'custom',
      name: 'Custom Range',
      description: 'Select specific date range',
    },
  ]

  const handleExport = async () => {
    setExportStatus('preparing')
    setExportProgress(0)

    try {
      // Simulate export preparation
      const steps = [
        'Gathering events data...',
        'Collecting expenses and payments...',
        'Processing images and attachments...',
        'Formatting export file...',
        'Finalizing download...',
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setExportProgress(((i + 1) / steps.length) * 100)
      }

      // Simulate creating download URL
      const mockData = {
        events: [
          { id: '1', name: "Sarah & John's Wedding", totalBudget: 12000 },
          { id: '2', name: 'College Graduation Party', totalBudget: 3000 },
        ],
        exportDate: new Date().toISOString(),
        format: selectedFormat,
        includeImages,
      }

      const blob = new Blob([JSON.stringify(mockData, null, 2)], {
        type: selectedFormat === 'json' ? 'application/json' : 'text/csv',
      })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setExportStatus('ready')

      console.log('Export prepared:', {
        format: selectedFormat,
        includeImages,
        dateRange,
      })
      // In real app, this would call a Firebase Cloud Function to prepare the export
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('idle')
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      setExportStatus('downloading')
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `budgetbyme-export-${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        setExportStatus('completed')
        setTimeout(() => {
          handleClose()
        }, 2000)
      }, 1000)
    }
  }

  const handleClose = () => {
    setExportStatus('idle')
    setExportProgress(0)
    setDownloadUrl(null)
    setSelectedFormat('json')
    setIncludeImages(true)
    setDateRange('all')
    onClose()
  }

  const getStatusContent = () => {
    switch (exportStatus) {
      case 'preparing':
        return {
          title: 'Preparing Your Export',
          description: 'Please wait while we gather and format your data...',
          showProgress: true,
        }
      case 'ready':
        return {
          title: 'Export Ready',
          description: 'Your data export is ready for download.',
          showProgress: false,
        }
      case 'downloading':
        return {
          title: 'Downloading...',
          description: 'Your export is being downloaded to your device.',
          showProgress: false,
        }
      case 'completed':
        return {
          title: 'Export Complete',
          description: 'Your data has been successfully downloaded.',
          showProgress: false,
        }
      default:
        return null
    }
  }

  const statusContent = getStatusContent()

  if (statusContent) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                    {exportStatus === 'completed' ? (
                      <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                    ) : (
                      <DocumentArrowDownIcon className="h-6 w-6 text-primary-600" />
                    )}
                  </div>

                  <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                    {statusContent.title}
                  </Dialog.Title>

                  <p className="text-sm text-gray-500 mb-6">
                    {statusContent.description}
                  </p>

                  {statusContent.showProgress && (
                    <div className="mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {Math.round(exportProgress)}% complete
                      </p>
                    </div>
                  )}

                  {exportStatus === 'ready' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleClose}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDownload}
                        className="btn-primary flex-1"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  {exportStatus === 'preparing' && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  )}

                  {exportStatus === 'downloading' && (
                    <div className="flex items-center justify-center">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
                      <DocumentArrowDownIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Export Your Data
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Export Format
                      </label>
                      <div className="space-y-3">
                        {formatOptions.map((format) => (
                          <label
                            key={format.id}
                            className="relative flex cursor-pointer"
                          >
                            <input
                              type="radio"
                              value={format.id}
                              checked={selectedFormat === format.id}
                              onChange={(e) =>
                                setSelectedFormat(
                                  e.target.value as ExportFormat,
                                )
                              }
                              className="sr-only"
                            />
                            <div
                              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                                selectedFormat === format.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {format.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format.description}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                  {format.fileSize}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Date Range
                      </label>
                      <div className="space-y-2">
                        {dateRangeOptions.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="radio"
                              value={option.id}
                              checked={dateRange === option.id}
                              onChange={(e) => setDateRange(e.target.value)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">
                                {option.name}
                              </span>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Export Options
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeImages}
                            onChange={(e) => setIncludeImages(e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">
                              Include Images
                            </span>
                            <p className="text-xs text-gray-500">
                              Export receipts, photos, and attachments
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Data Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        What will be exported:
                      </h4>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• All events and their details</li>
                        <li>• Budget categories and expenses</li>
                        <li>• Payment schedules and history</li>
                        <li>• Account and profile information</li>
                        {includeImages && (
                          <li>• Images and file attachments</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleClose}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExport}
                      className="btn-primary flex-1"
                    >
                      Start Export
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
