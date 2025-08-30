'use client';

import React from 'react';
import { ArrowUpTrayIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import AttachmentCard from '@/components/ui/AttachmentCard';
import FileUpload from '@/components/ui/FileUpload';
import type { AttachmentManager } from '@/hooks/useAttachmentManager';

interface AttachmentsSectionProps {
  attachments: string[] | null | undefined;
  attachmentManager: AttachmentManager;
}

const AttachmentsSection = React.memo<AttachmentsSectionProps>(({
  attachments,
  attachmentManager,
}) => {
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className='card'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <PaperClipIcon className='h-5 w-5 mr-2' />
        Attachments
      </h3>

      {hasAttachments ? (
        <div className='space-y-4'>
          {/* Attachments Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {attachments.map((url: string) => {
              const { fullFilename, originalName } = attachmentManager.getFileNameFromUrl(url);

              return (
                <AttachmentCard
                  key={url}
                  url={url}
                  filename={fullFilename}
                  originalName={originalName}
                  canDelete={true}
                  onDelete={() => attachmentManager.handleDeleteClick(url)}
                  disabled={attachmentManager.isPending}
                  isDeleting={attachmentManager.deletingAttachment === url}
                />
              );
            })}
          </div>

          {/* Upload New Attachment */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <div className='flex items-start space-x-4 mb-4'>
              <ArrowUpTrayIcon className='h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-gray-800 mb-3'>
                  Add New Attachment
                </h4>
                <p className='text-sm text-gray-600'>
                  Upload receipts, invoices, contracts, or other documents
                  related to this expense.
                </p>
              </div>
            </div>
            <FileUpload
              file={attachmentManager.primaryFile}
              onFileChange={attachmentManager.handlePrimaryFileChange}
              onFileRemove={attachmentManager.handlePrimaryFileRemove}
              accept='.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx'
              maxSize={5}
              disabled={attachmentManager.isPending}
              isLoading={
                attachmentManager.isOperationInProgress &&
                attachmentManager.fileUploadState.operationType === 'uploading'
              }
              loadingMessage='Uploading attachment...'
              label='Choose file or drag and drop'
              description='JPG, PNG, WebP, PDF, DOC, DOCX files'
            />
          </div>
        </div>
      ) : (
        /* No Attachments - Show Upload Option */
        <div className='space-y-4'>
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='flex items-start space-x-4 mb-4'>
              <ArrowUpTrayIcon className='h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <span className='font-semibold text-gray-700'>
                  No Attachments
                </span>
                <p className='text-sm text-gray-600 mt-1'>
                  Upload receipts, invoices, contracts, or other documents
                  related to this expense for better record keeping.
                </p>
              </div>
            </div>
            <FileUpload
              file={attachmentManager.emptyStateFile}
              onFileChange={attachmentManager.handleEmptyStateFileChange}
              onFileRemove={attachmentManager.handleEmptyStateFileRemove}
              accept='.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx'
              maxSize={5}
              disabled={attachmentManager.isPending}
              isLoading={
                attachmentManager.isOperationInProgress &&
                attachmentManager.fileUploadState.operationType === 'uploading'
              }
              loadingMessage='Uploading attachment...'
              label='Choose file or drag and drop'
              description='JPG, PNG, WebP, PDF, DOC, DOCX files'
            />
          </div>
        </div>
      )}
    </div>
  );
});

AttachmentsSection.displayName = 'AttachmentsSection';

export default AttachmentsSection;