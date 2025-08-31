'use client';

import {
  CalendarIcon,
  DocumentTextIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Expense } from '@/types/Expense';

interface ExpenseBasicInfoProps {
  expense: Expense;
  tags: string[];
  isEditingTags: boolean;
  newTag: string;
  onTagsChange: {
    addTag: () => void;
    deleteTag: (tag: string) => void;
    setNewTag: (tag: string) => void;
    toggleEditing: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
  };
}

const ExpenseBasicInfo = React.memo<ExpenseBasicInfoProps>(
  ({ expense, tags, isEditingTags, newTag, onTagsChange }) => {
    return (
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <DocumentTextIcon className='h-5 w-5 mr-2' />
          Basic Information
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Expense Name
            </div>
            <p className='mt-1 text-base font-medium text-gray-900'>
              {expense.name}
            </p>
          </div>

          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Category
            </div>
            <div className='mt-1 flex items-center'>
              <div
                className='w-3 h-3 rounded-full mr-2'
                style={{ backgroundColor: expense.category.color }}
              />
              <p className='text-base font-medium text-gray-900'>
                {expense.category.name}
              </p>
            </div>
          </div>

          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Date
            </div>
            <div className='mt-1 flex items-center'>
              <CalendarIcon className='h-4 w-4 text-gray-400 mr-2' />
              <p className='text-base text-gray-900'>
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Amount
            </div>
            <p className='mt-1 text-base font-semibold text-gray-900'>
              {formatCurrency(expense.amount)}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className='text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center mb-2'>
              Tags
              <button
                type='button'
                onClick={onTagsChange.toggleEditing}
                className='ml-2 text-xs text-primary-600 hover:text-primary-700 font-medium normal-case'
              >
                ({isEditingTags ? 'Cancel' : 'Edit'})
              </button>
            </label>

            {/* Add Tag Input */}
            {isEditingTags && (
              <div className='mb-2'>
                <div className='flex gap-1'>
                  <input
                    type='text'
                    value={newTag}
                    onChange={(e) => onTagsChange.setNewTag(e.target.value)}
                    onKeyDown={onTagsChange.handleKeyPress}
                    placeholder='Add tag...'
                    className='flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500'
                    maxLength={15}
                  />
                  <button
                    type='button'
                    onClick={onTagsChange.addTag}
                    disabled={!newTag.trim() || tags.includes(newTag.trim())}
                    className='text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Tags Display */}
            {tags.length > 0 ? (
              <div className='flex flex-wrap gap-1 items-center'>
                <TagIcon className='h-3 w-3 text-gray-400 mr-1 flex-shrink-0' />
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className={`inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded transition-colors duration-200 ${
                      isEditingTags ? 'hover:bg-gray-200' : ''
                    }`}
                  >
                    <span className='truncate max-w-[80px]'>{tag}</span>
                    {isEditingTags && (
                      <button
                        type='button'
                        onClick={() => onTagsChange.deleteTag(tag)}
                        className='ml-1 text-red-600 hover:text-red-700'
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <TagIcon className='h-3 w-3 text-gray-400 flex-shrink-0' />
                <span className='text-gray-500 text-xs'>No tags</span>
                {!isEditingTags && (
                  <button
                    type='button'
                    onClick={onTagsChange.toggleEditing}
                    className='text-primary-600 hover:text-primary-700 text-xs font-medium'
                  >
                    Add
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes - if needed for future */}
          <div>
            <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
              Notes
            </div>
            <p className='mt-1 text-sm text-gray-700'>
              {expense.notes || 'No notes added'}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

ExpenseBasicInfo.displayName = 'ExpenseBasicInfo';

export default ExpenseBasicInfo;
