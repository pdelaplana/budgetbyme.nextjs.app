'use client';

import {
  InformationCircleIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
  type CategoryTemplate,
  getCategoryTemplates,
} from '@/lib/categoryTemplates';
import type { EventType } from '@/types/Event';

interface CategorySelectorProps {
  eventType: EventType;
  selectedCategories: string[];
  onSelectionChange: (categoryIds: string[]) => void;
}

export default function CategorySelector({
  eventType,
  selectedCategories,
  onSelectionChange,
}: CategorySelectorProps) {
  const templates = getCategoryTemplates(eventType);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      onSelectionChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      // Add category
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(templates.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const allSelected = selectedCategories.length === templates.length;

  return (
    <div className='space-y-3'>
      {/* Header with action buttons */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='form-label mb-0'>
            <RectangleStackIcon className='h-4 w-4 inline mr-2' />
            Suggested Categories
          </div>
          <div className='relative'>
            <InformationCircleIcon
              className='h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors'
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg'>
                💡 You can skip this step and add categories later
                <div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
              </div>
            )}
          </div>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            className='text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors'
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Scrollable category list */}
      <div className='border border-gray-200 rounded-lg bg-gray-50 max-h-[300px] overflow-y-auto'>
        <div className='p-3 space-y-2'>
          {templates.map((template: CategoryTemplate) => {
            const isSelected = selectedCategories.includes(template.id);

            return (
              <label
                key={template.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                {/* Checkbox */}
                <input
                  type='checkbox'
                  checked={isSelected}
                  onChange={() => handleToggleCategory(template.id)}
                  className='mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                />

                {/* Icon */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg text-2xl flex-shrink-0
                    ${isSelected ? 'opacity-100' : 'opacity-60'}
                  `}
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  {template.icon}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {template.name}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-gray-600' : 'text-gray-500'
                    }`}
                  >
                    {template.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selection counter */}
      <div className='text-xs text-gray-500'>
        <span>
          {selectedCategories.length} of {templates.length} categories selected
        </span>
      </div>
    </div>
  );
}
