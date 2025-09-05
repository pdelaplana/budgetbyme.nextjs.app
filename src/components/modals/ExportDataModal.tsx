'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exportData } from '@/server/actions/jobs/exportData';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportStatus = 'idle' | 'preparing' | 'completed';

export default function ExportDataModal({
  isOpen,
  onClose,
}: ExportDataModalProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const { user } = useAuth();

  // Reset to idle when modal opens
  useEffect(() => {
    if (isOpen) {
      setExportStatus('idle');
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!user) {
      console.error('No authenticated user');
      return;
    }

    setExportStatus('preparing');

    try {
      await exportData(user.uid);
      setExportStatus('completed');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('idle');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getStatusContent = () => {
    switch (exportStatus) {
      case 'preparing':
        return {
          title: 'Submitting Export Request',
          description: 'Please wait while we submit your export request...',
          showProgress: true,
        };
      case 'completed':
        return {
          title: 'Export Request Submitted',
          description:
            'Export request submitted! Check your email for the download link.',
          showProgress: false,
        };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();

  if (statusContent) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => {
            // Prevent closing during export process
          }}
        >
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </TransitionChild>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <TransitionChild
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all'>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4'>
                    {exportStatus === 'completed' ? (
                      <CheckCircleIcon className='h-6 w-6 text-primary-600' />
                    ) : (
                      <DocumentArrowDownIcon className='h-6 w-6 text-primary-600' />
                    )}
                  </div>

                  <DialogTitle className='text-lg font-semibold text-gray-900 mb-2'>
                    {statusContent.title}
                  </DialogTitle>

                  <p className='text-sm text-gray-500 mb-6'>
                    {statusContent.description}
                  </p>

                  {statusContent.showProgress && (
                    <div className='mb-6'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto'></div>
                    </div>
                  )}

                  {exportStatus === 'completed' && (
                    <button
                      type='button'
                      onClick={handleClose}
                      className='btn-primary w-full'
                    >
                      Close
                    </button>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </TransitionChild>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel className='w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg'>
                      <DocumentArrowDownIcon className='w-4 h-4 text-primary-600' />
                    </div>
                    <DialogTitle className='text-lg font-semibold text-gray-900'>
                      Export Your Data
                    </DialogTitle>
                  </div>
                  <button
                    type='button'
                    onClick={handleClose}
                    className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1'
                    aria-label='Close modal'
                  >
                    <XMarkIcon className='w-5 h-5' />
                  </button>
                </div>

                {/* Content */}
                <div className='p-6'>
                  <div className='space-y-6'>
                    <p className='text-sm text-gray-600'>
                      Export all your BudgetByMe data as a CSV file. The export
                      will be sent to your email address.
                    </p>

                    {/* Data Summary */}
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h4 className='text-sm font-medium text-gray-900 mb-2'>
                        What will be exported:
                      </h4>
                      <ul className='text-xs text-gray-500 space-y-1'>
                        <li>• All events and their details</li>
                        <li>• Budget categories and expenses</li>
                        <li>• Payment schedules and history</li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex space-x-3 mt-6 pt-6 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={handleClose}
                      className='btn-secondary flex-1'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onClick={handleExport}
                      className='btn-primary flex-1'
                    >
                      Start Export
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
