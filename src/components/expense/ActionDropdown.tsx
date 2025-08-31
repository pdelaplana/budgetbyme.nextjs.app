'use client';

import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

interface ActionDropdownProps {
  isOpen: boolean;
  isMobile?: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionDropdown = React.memo<ActionDropdownProps>(
  ({ isOpen, isMobile = false, onToggle, onClose, onEdit, onDelete }) => {
    const handleEdit = () => {
      onEdit();
      onClose();
    };

    const handleDelete = () => {
      onDelete();
      onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isMobile) {
      return (
        <div className='flex-shrink-0 sm:hidden'>
          <div className='relative'>
            <button
              type='button'
              onClick={onToggle}
              className='btn-secondary flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px]'
              aria-label='Open action menu'
            >
              <EllipsisVerticalIcon className='h-5 w-5' />
            </button>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
              <div className='absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right'>
                <div className='py-1'>
                  <button
                    type='button'
                    onClick={handleEdit}
                    className='flex items-center gap-3 w-full px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[48px]'
                  >
                    <PencilIcon className='h-5 w-5 flex-shrink-0' />
                    <span>Edit Expense</span>
                  </button>
                  <button
                    type='button'
                    onClick={handleDelete}
                    className='flex items-center gap-3 w-full px-4 py-4 text-base text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 min-h-[48px]'
                  >
                    <TrashIcon className='h-5 w-5 flex-shrink-0' />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Dropdown Backdrop */}
            {isOpen && (
              <button
                type='button'
                className='fixed inset-0 z-40 cursor-default'
                onClick={onClose}
                aria-label='Close menu'
              />
            )}
          </div>
        </div>
      );
    }

    // Desktop version
    return (
      <div className='hidden sm:flex relative flex-shrink-0 overflow-visible'>
        <div className='flex'>
          <button
            type='button'
            onClick={onEdit}
            className='btn-secondary flex items-center rounded-r-none border-r-0'
          >
            <PencilIcon className='h-4 w-4 mr-2' />
            Edit
          </button>
          <button
            type='button'
            onClick={onToggle}
            className='btn-secondary px-2 rounded-l-none border-l border-gray-300 hover:border-gray-400'
            aria-label='More actions'
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Desktop Dropdown Menu */}
        {isOpen && (
          <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right transform'>
            <div className='py-1'>
              <button
                type='button'
                onClick={handleDelete}
                className='flex items-center gap-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200'
              >
                <TrashIcon className='h-4 w-4 flex-shrink-0' />
                <span>Delete Expense</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Dropdown Backdrop */}
        {isOpen && (
          <button
            type='button'
            className='fixed inset-0 z-40 bg-transparent border-none p-0 cursor-default'
            onClick={onClose}
            onKeyDown={handleKeyDown}
            aria-label='Close dropdown menu'
          />
        )}
      </div>
    );
  },
);

ActionDropdown.displayName = 'ActionDropdown';

export default ActionDropdown;
