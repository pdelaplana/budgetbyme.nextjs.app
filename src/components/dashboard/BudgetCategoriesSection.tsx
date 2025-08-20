'use client';

import React from 'react';
import BudgetCategoriesList from '@/components/dashboard/BudgetCategoriesList';
import type { BudgetCategory } from '@/types/BudgetCategory';

interface BudgetCategoriesSectionProps {
  categories: BudgetCategory[];
  onCategoryClick: (categoryId: string) => void;
  onCreateFirstCategory: () => void;
}

export default function BudgetCategoriesSection({ 
  categories, 
  onCategoryClick, 
  onCreateFirstCategory 
}: BudgetCategoriesSectionProps) {
  const hasCategories = categories.length > 0;

  return (
    <div className='card'>
      <div className='card-header'>
        <h2 className='text-heading font-semibold text-gray-900'>
          Budget Categories
        </h2>
      </div>
      
      {hasCategories ? (
        <BudgetCategoriesList
          categories={categories}
          onCategoryClick={onCategoryClick}
          onCreateCategory={onCreateFirstCategory}
        />
      ) : (
        /* Empty state for categories */
        <div className='p-6 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4'>
            <svg className='h-6 w-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Budget Categories Yet
          </h3>
          <p className='text-gray-600 mb-6 max-w-md mx-auto'>
            Start organizing your event budget by creating categories like "Venue", "Catering", "Photography", etc. This will help you track expenses more effectively.
          </p>
          <div className='space-y-3'>
            <button
              onClick={onCreateFirstCategory}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200'
            >
              <svg className='h-4 w-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Create Your First Category
            </button>
            <div className='text-xs text-gray-500'>
              Popular categories: Venue • Catering • Photography • Flowers • Music
            </div>
          </div>
        </div>
      )}
    </div>
  );
}