'use client'

import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import type React from 'react'
import { useState } from 'react'

export interface ActionDropdownOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface ActionDropdownProps {
  primaryAction?: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
  }
  options: ActionDropdownOption[]
  variant?: 'mobile-only' | 'desktop-split' | 'full'
  className?: string
}

export default function ActionDropdown({
  primaryAction,
  options,
  variant = 'full',
  className = '',
}: ActionDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleOptionClick = (option: ActionDropdownOption) => {
    setShowDropdown(false)
    option.onClick()
  }

  const handlePrimaryAction = () => {
    if (primaryAction) {
      primaryAction.onClick()
    }
  }

  return (
    <div className={`relative flex-shrink-0 overflow-visible ${className}`}>
      {/* Mobile: Three-dot menu (for mobile-only and full variants) */}
      {(variant === 'mobile-only' || variant === 'full') && (
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="btn-secondary flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px]"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {/* Mobile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right">
              <div className="py-1">
                {/* Primary action for mobile (if exists) */}
                {primaryAction && (
                  <button
                    onClick={() => {
                      handlePrimaryAction()
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[48px]"
                  >
                    <primaryAction.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{primaryAction.label}</span>
                  </button>
                )}

                {/* Other options */}
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`flex items-center gap-3 w-full px-4 py-4 text-base transition-colors duration-200 min-h-[48px] ${
                      option.variant === 'danger'
                        ? 'text-red-700 hover:bg-red-50 active:bg-red-100'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <option.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop: Split button (for desktop-split and full variants) */}
      {(variant === 'desktop-split' || variant === 'full') && primaryAction && (
        <div className="hidden sm:flex">
          <button
            onClick={handlePrimaryAction}
            className="btn-secondary flex items-center rounded-r-none border-r-0"
          >
            <primaryAction.icon className="h-4 w-4 mr-2" />
            {primaryAction.label}
          </button>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="btn-secondary px-2 rounded-l-none border-l border-gray-300 hover:border-gray-400"
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Desktop Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right">
              <div className="py-1">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors duration-200 ${
                      option.variant === 'danger'
                        ? 'text-red-700 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <option.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
