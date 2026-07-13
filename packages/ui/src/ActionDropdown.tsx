'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';

/**
 * Shared ActionDropdown, built on HeadlessUI's `Menu`.
 *
 * Consolidates three previously-duplicated app-side implementations into one
 * accessible component. Key design decisions:
 *
 * 1. State is SELF-CONTAINED (uncontrolled). HeadlessUI's `Menu` owns
 *    open/close, keyboard navigation, focus management, focus-return, and
 *    click-outside internally, so this component intentionally does NOT accept
 *    `isOpen`/`onToggle`/`onClose` props. Call sites that previously passed
 *    that plumbing will have it removed when they migrate.
 * 2. Icons are `React.ComponentType<{ className?: string }>` for both
 *    `primaryAction.icon` and `options[].icon` (the string-icon convention of
 *    one legacy impl is not propagated here).
 * 3. Per-callsite label wording (e.g. "Delete" vs "Delete Expense") lives in
 *    the caller-supplied `label`, not in component logic — there is a single
 *    `options` array, so a caller picks one label per option.
 *
 * Variants:
 * - `mobile-only`: three-dot icon trigger; dropdown lists primaryAction first
 *   (if present), then options.
 * - `desktop-split`: split button — primaryAction is a direct button; a
 *   chevron toggle opens a dropdown listing ONLY options.
 * - `full`: mobile-only tree (shown < sm) + desktop-split tree (shown >= sm).
 * - `single`: one labelled trigger ("Actions" by default), same on all
 *   breakpoints; dropdown lists primaryAction first (if present), then options.
 */

export interface ActionDropdownOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export interface ActionDropdownProps {
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  options: ActionDropdownOption[];
  variant?: 'mobile-only' | 'desktop-split' | 'full' | 'single';
  triggerLabel?: string;
  className?: string;
}

function Spinner() {
  return (
    <svg
      className='animate-spin h-4 w-4 flex-shrink-0'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      aria-hidden='true'
    >
      <title>Loading</title>
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  );
}

const MENU_ITEM_BASE =
  'group flex w-full items-center px-4 py-2 text-sm min-h-[48px] text-left data-[focus]:bg-gray-100 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed';

function OptionMenuItem({ option }: { option: ActionDropdownOption }) {
  const {
    label,
    icon: Icon,
    onClick,
    variant = 'default',
    disabled,
    loading,
    loadingLabel,
  } = option;
  const isDisabled = Boolean(disabled) || Boolean(loading);
  const colorClass =
    variant === 'danger'
      ? 'text-red-700 data-[focus]:bg-red-50'
      : 'text-gray-700';

  return (
    <MenuItem disabled={isDisabled}>
      <button
        type='button'
        onClick={onClick}
        className={`${MENU_ITEM_BASE} ${colorClass}`}
      >
        {loading ? (
          <>
            <Spinner />
            <span className='ml-3'>{loadingLabel ?? label}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className='mr-3 h-5 w-5 flex-shrink-0' />}
            <span>{label}</span>
          </>
        )}
      </button>
    </MenuItem>
  );
}

function PrimaryMenuItem({
  primaryAction,
}: {
  primaryAction: NonNullable<ActionDropdownProps['primaryAction']>;
}) {
  const { label, icon: Icon, onClick } = primaryAction;
  return (
    <MenuItem>
      <button
        type='button'
        onClick={onClick}
        className={`${MENU_ITEM_BASE} font-medium text-gray-900`}
      >
        {Icon && <Icon className='mr-3 h-5 w-5 flex-shrink-0' />}
        <span>{label}</span>
      </button>
    </MenuItem>
  );
}

const MENU_ITEMS_CLASS =
  'absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1';

/** Dropdown listing primaryAction first (if included) then options. */
function OptionsMenu({
  trigger,
  options,
  primaryAction,
  includePrimary,
  className = '',
}: {
  trigger: React.ReactNode;
  options: ActionDropdownOption[];
  primaryAction?: ActionDropdownProps['primaryAction'];
  includePrimary: boolean;
  className?: string;
}) {
  return (
    <Menu as='div' className={`relative inline-block text-left ${className}`}>
      {trigger}
      <MenuItems className={MENU_ITEMS_CLASS}>
        {includePrimary && primaryAction && (
          <PrimaryMenuItem primaryAction={primaryAction} />
        )}
        {options.map((option) => (
          <OptionMenuItem key={option.id} option={option} />
        ))}
      </MenuItems>
    </Menu>
  );
}

/** Three-dot icon-only trigger + dropdown (primaryAction first, then options). */
function MobileMenu({
  options,
  primaryAction,
  className = '',
}: {
  options: ActionDropdownOption[];
  primaryAction?: ActionDropdownProps['primaryAction'];
  className?: string;
}) {
  return (
    <OptionsMenu
      className={className}
      options={options}
      primaryAction={primaryAction}
      includePrimary
      trigger={
        <MenuButton
          aria-label='Toggle actions menu'
          className='inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
        >
          <EllipsisVerticalIcon className='h-6 w-6' />
        </MenuButton>
      }
    />
  );
}

/** Split button: primaryAction as a direct button + chevron dropdown of options. */
function DesktopSplit({
  options,
  primaryAction,
  className = '',
}: {
  options: ActionDropdownOption[];
  primaryAction: NonNullable<ActionDropdownProps['primaryAction']>;
  className?: string;
}) {
  const { label, icon: Icon, onClick } = primaryAction;
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      <button
        type='button'
        onClick={onClick}
        className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500'
      >
        {Icon && <Icon className='mr-2 h-5 w-5 flex-shrink-0' />}
        {label}
      </button>
      <Menu as='div' className='relative -ml-px block'>
        <MenuButton
          aria-label='More actions'
          className='inline-flex h-full items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500'
        >
          <ChevronDownIcon className='h-5 w-5' />
        </MenuButton>
        <MenuItems className={MENU_ITEMS_CLASS}>
          {options.map((option) => (
            <OptionMenuItem key={option.id} option={option} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}

export default function ActionDropdown({
  primaryAction,
  options,
  variant = 'full',
  triggerLabel = 'Actions',
  className = '',
}: ActionDropdownProps) {
  if (variant === 'single') {
    return (
      <OptionsMenu
        className={className}
        options={options}
        primaryAction={primaryAction}
        includePrimary
        trigger={
          <MenuButton className='group inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
            {triggerLabel}
            <ChevronDownIcon
              className='ml-2 h-5 w-5 transition-transform group-data-[open]:rotate-180'
              aria-hidden='true'
            />
          </MenuButton>
        }
      />
    );
  }

  if (variant === 'mobile-only') {
    return (
      <MobileMenu
        className={className}
        options={options}
        primaryAction={primaryAction}
      />
    );
  }

  if (variant === 'desktop-split') {
    if (!primaryAction) return null;
    return (
      <DesktopSplit
        className={className}
        options={options}
        primaryAction={primaryAction}
      />
    );
  }

  // variant === 'full': mobile three-dot (< sm) + desktop split (>= sm).
  return (
    <div className={className}>
      <div className='sm:hidden'>
        <MobileMenu options={options} primaryAction={primaryAction} />
      </div>
      {primaryAction && (
        <div className='hidden sm:block'>
          <DesktopSplit options={options} primaryAction={primaryAction} />
        </div>
      )}
    </div>
  );
}
