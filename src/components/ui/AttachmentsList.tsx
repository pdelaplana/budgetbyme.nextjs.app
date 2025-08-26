'use client';

import { PaperClipIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { deleteExpenseAttachment } from '@/server/actions/expenses/deleteExpenseAttachment';
import AttachmentCard from './AttachmentCard';
import FileUpload from './FileUpload';

export interface AttachmentData {
  url: string;
  filename: string;
  originalName: string;
  size?: number;
  uploadDate?: Date;
}

interface AttachmentsListProps {
  attachments: AttachmentData[];
  expenseId: string;
  canDelete?: boolean;
  canAdd?: boolean;
  onAttachmentAdd?: (file: File) => Promise<void>;
  onAttachmentDelete?: (attachmentUrl: string) => Promise<void>;
  onAttachmentPreview?: (attachment: AttachmentData) => void;
  disabled?: boolean;
  className?: string;
  maxAttachments?: number;
  emptyStateMessage?: string;
}

export default function AttachmentsList({
  attachments,
  expenseId,
  canDelete = true,
  canAdd = true,
  onAttachmentAdd,
  onAttachmentDelete,
  onAttachmentPreview,
  disabled = false,
  className = '',
  maxAttachments = 10,
  emptyStateMessage = 'No attachments yet. Upload receipts, invoices, or documents.',
}: AttachmentsListProps) {
  const { user } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasAttachments = attachments.length > 0;
  const canAddMore = canAdd && attachments.length < maxAttachments && !disabled;

  const handleFileChange = (file: File | null) => {
    setUploadingFile(file);
  };

  const handleFileRemove = () => {
    setUploadingFile(null);
  };

  const handleUpload = async () => {
    if (!uploadingFile || !onAttachmentAdd) return;

    setIsUploading(true);
    try {
      await onAttachmentAdd(uploadingFile);
      setUploadingFile(null);
      setShowUploadForm(false);
      toast.success('Attachment uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload attachment',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentUrl: string) => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Call server action to delete from storage
      const result = await deleteExpenseAttachment(
        user.uid,
        attachmentUrl,
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete attachment');
      }

      // Call parent callback to update the UI and database
      if (onAttachmentDelete) {
        await onAttachmentDelete(attachmentUrl);
      }

      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete attachment',
      );
    }
  };

  const handleCancelUpload = () => {
    setUploadingFile(null);
    setShowUploadForm(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <PaperClipIcon className='h-5 w-5 text-gray-400' />
          <h3 className='text-sm font-medium text-gray-900'>
            Attachments {hasAttachments && `(${attachments.length})`}
          </h3>
        </div>

        {canAddMore && !showUploadForm && (
          <button
            type='button'
            onClick={() => setShowUploadForm(true)}
            className='btn-secondary btn-sm flex items-center space-x-1'
            disabled={disabled}
          >
            <PlusIcon className='h-4 w-4' />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && canAddMore && (
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <div className='space-y-4'>
            <FileUpload
              file={uploadingFile}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
              accept='.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx'
              maxSize={5}
              disabled={isUploading}
              label='Upload Attachment'
              description='JPG, PNG, PDF, DOC files up to 5MB'
            />

            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={handleUpload}
                disabled={!uploadingFile || isUploading}
                className='btn-primary btn-sm flex items-center space-x-1'
              >
                {isUploading ? (
                  <div className='h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  <PlusIcon className='h-3 w-3' />
                )}
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              </button>

              <button
                type='button'
                onClick={handleCancelUpload}
                disabled={isUploading}
                className='btn-secondary btn-sm'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Grid */}
      {hasAttachments ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {attachments.map((attachment, index) => (
            <AttachmentCard
              key={`${attachment.url}-${index}`}
              url={attachment.url}
              filename={attachment.filename}
              originalName={attachment.originalName}
              size={attachment.size}
              uploadDate={attachment.uploadDate}
              canDelete={canDelete}
              onDelete={() => handleDelete(attachment.url)}
              onPreview={
                onAttachmentPreview
                  ? () => onAttachmentPreview(attachment)
                  : undefined
              }
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className='text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
          <PaperClipIcon className='h-8 w-8 text-gray-400 mx-auto mb-3' />
          <p className='text-sm text-gray-600 mb-4'>{emptyStateMessage}</p>

          {canAddMore && !showUploadForm && (
            <button
              type='button'
              onClick={() => setShowUploadForm(true)}
              className='btn-primary btn-sm flex items-center space-x-1 mx-auto'
              disabled={disabled}
            >
              <PlusIcon className='h-4 w-4' />
              <span>Add First Attachment</span>
            </button>
          )}
        </div>
      )}

      {/* Attachment Limit Warning */}
      {attachments.length >= maxAttachments && (
        <div className='text-xs text-gray-500 text-center'>
          Maximum of {maxAttachments} attachments reached
        </div>
      )}
    </div>
  );
}
