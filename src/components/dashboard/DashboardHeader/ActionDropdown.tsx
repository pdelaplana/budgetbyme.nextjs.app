'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownItem {
  id: string;
  label: string;
  icon: string;
}

interface ActionDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onActionSelect: (actionId: string) => void;
  items: DropdownItem[];
  isRecalculatingTotals?: boolean;
}

export default function ActionDropdown({
  isOpen,
  onToggle,
  onClose,
  onActionSelect,
  items,
  isRecalculatingTotals = false,
}: ActionDropdownProps) {
  return (
    <div className='relative'>
      <button
        type='button'
        onClick={onToggle}
        className='btn-primary flex items-center gap-2 px-3 sm:px-4 py-2'
      >
        <span className='hidden sm:inline'>Actions</span>
        <span className='sm:hidden'>Actions</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
          <div className='py-1'>
            {items.map((item) => {
              const isRecalculating =
                item.id === 'recalculate-totals' && isRecalculatingTotals;
              const isDisabled = isRecalculating;

              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => onActionSelect(item.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors duration-200 ${
                    isDisabled
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className='text-base'>
                    {isRecalculating ? (
                      <svg
                        className='animate-spin h-4 w-4 text-gray-400'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        aria-label='Loading'
                      >
                        <title>Loading</title>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span>
                    {isRecalculating ? 'Recalculating...' : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dropdown Backdrop */}
      {isOpen && (
        <button
          type='button'
          className='fixed inset-0 z-40'
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          aria-label='Close dropdown'
        />
      )}
    </div>
  );
}
