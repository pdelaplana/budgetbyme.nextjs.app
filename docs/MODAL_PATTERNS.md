# Modal Patterns Documentation

This document outlines the modal implementation patterns used in the BudgetByMe Next.js application, providing guidelines for creating consistent and maintainable modal components.

## Overview

The application uses **custom modal implementations** rather than a shared modal component library. There are three primary modal patterns, each suited for different use cases:

1. **Fullscreen Modals** - For complex forms and detailed data entry
2. **Dialog Modals** - For confirmations and simple interactions  
3. **HeadlessUI Modals** - For complex multi-step processes

## Pattern 1: Fullscreen Modals

**Used for:** Complex forms, data entry, detailed editing interfaces

**Examples:**
- `AddOrEditEventModal.tsx` (506 lines)
- `AddOrEditExpenseModal.tsx` (738 lines)
- `MarkAsPaidModal.tsx` (598 lines)
- `AddOrEditCategoryModal.tsx` (482 lines)

### Implementation Pattern

```typescript
'use client';

import { XMarkIcon, /* other icons */ } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

interface YourModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Additional props specific to your modal
}

export default function YourModal({ isOpen, onClose }: YourModalProps) {
  // Early return pattern
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-white z-50 flex flex-col'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-3 flex-1 min-w-0'>
              {/* Icon */}
              <YourIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  Modal Title
                </h2>
                <p className='text-sm text-gray-600 truncate'>
                  Subtitle or description
                </p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className='ml-4 text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Close modal'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Your form content here */}
        </div>
      </div>

      {/* Fixed Footer (if needed) */}
      <div className='flex-shrink-0 bg-white border-t border-gray-200'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn-primary'
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Key Features:

- **Full viewport coverage** with `fixed inset-0`
- **Fixed header** with title, icon, and close button
- **Scrollable content area** for long forms
- **Optional fixed footer** for action buttons
- **Responsive design** with container max-width
- **Early return** with `if (!isOpen) return null`

### Best Practices:

1. **Always include a close button** in the header
2. **Use semantic HTML** with proper headings and labels
3. **Implement form validation** with error states
4. **Add loading states** for async operations
5. **Handle keyboard navigation** (Tab, Escape)
6. **Use consistent spacing** with Tailwind classes

## Pattern 2: Dialog Modals

**Used for:** Confirmations, simple inputs, lightweight interactions

**Examples:**
- `ConfirmDialog.tsx` (160 lines) - Reusable confirmation dialog
- `ConfirmRecalculateModal.tsx` (82 lines) - Specific confirmation
- `ImageCropModal.tsx` (218 lines) - Simple utility modal

### Implementation Pattern

```typescript
'use client';

import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface YourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function YourDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}: YourDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              className="flex-1 btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="button"
              className="flex-1 btn-primary"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Key Features:

- **Centered overlay** with backdrop
- **Compact size** with max-width constraint
- **Icon-based messaging** for visual hierarchy
- **Action buttons** in footer
- **Loading states** with disabled interactions

## Pattern 3: HeadlessUI Modals

**Used for:** Complex state management, animations, accessibility

**Examples:**
- `DeleteAccountModal.tsx` (399 lines) - Multi-step process
- `ExportDataModal.tsx` (478 lines) - Complex workflow

### Implementation Pattern

```typescript
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

interface HeadlessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeadlessModal({ isOpen, onClose }: HeadlessModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        {/* Modal Content */}
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title className='text-lg font-medium leading-6 text-gray-900'>
                  Modal Title
                </Dialog.Title>
                
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Modal content here
                  </p>
                </div>

                <div className='mt-4 flex justify-end space-x-2'>
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='btn-primary'
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
```

### Key Features:

- **Built-in accessibility** (focus management, ARIA)
- **Smooth animations** with Transition components
- **Automatic backdrop handling**
- **Better keyboard navigation**

## Common Patterns Across All Types

### 1. Props Interface Structure

```typescript
interface YourModalProps {
  // Core modal control
  isOpen: boolean;
  onClose: () => void;
  
  // Data props
  data?: SomeDataType;
  editingItem?: ItemType | null;
  
  // Behavior flags
  isEditMode?: boolean;
  isLoading?: boolean;
  
  // Callback functions
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### 2. State Management Pattern

```typescript
export default function YourModal({ isOpen, onClose }: YourModalProps) {
  // Form state
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  // Early return pattern
  if (!isOpen) return null;
  
  // ... rest of component
}
```

### 3. Form Validation Pattern

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 4. Loading States Pattern

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  
  try {
    await someAsyncOperation();
    toast.success('Operation completed successfully!');
    onClose();
  } catch (error) {
    toast.error('Operation failed');
  } finally {
    setIsSubmitting(false);
  }
};
```

## Styling Guidelines

### Tailwind Classes Convention

```typescript
// Container classes
'fixed inset-0 z-50'          // Fullscreen overlay
'max-w-2xl mx-auto'           // Centered content container
'px-4 sm:px-6 lg:px-8'       // Responsive horizontal padding

// Button classes
'btn-primary'                  // Primary action button
'btn-secondary'                // Secondary action button
'text-gray-400 hover:text-gray-600'  // Icon button states

// Form input classes
'input-field'                  // Standard input styling
'input-error'                  // Error state styling

// Layout classes
'flex items-center justify-between'  // Header layout
'space-x-3'                    // Horizontal spacing
'space-y-4'                    // Vertical spacing
```

### Responsive Design

```typescript
// Text sizing
'text-lg sm:text-xl'           // Responsive heading
'text-sm'                      // Body text
'text-xs'                      // Small text/labels

// Spacing
'py-4'                         // Padding
'p-4 sm:p-6 lg:p-8'           // Responsive padding
'gap-3 sm:gap-4'              // Responsive gaps

// Layout
'flex-col sm:flex-row'         // Responsive flex direction
'w-full sm:w-auto'            // Responsive width
```

## Integration Pattern

### In Parent Component

```typescript
export default function ParentComponent() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemType | null>(null);
  
  const handleOpenModal = (item?: ItemType) => {
    setEditingItem(item || null);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };
  
  return (
    <div>
      {/* Trigger button */}
      <button onClick={() => handleOpenModal()}>
        Add New Item
      </button>
      
      {/* Modal component */}
      <YourModal
        isOpen={showModal}
        onClose={handleCloseModal}
        editingItem={editingItem}
        isEditMode={!!editingItem}
      />
    </div>
  );
}
```

## Accessibility Guidelines

1. **Use semantic HTML elements** (`button`, `form`, `h2`, etc.)
2. **Provide ARIA labels** for icon-only buttons
3. **Implement keyboard navigation** (Tab, Escape, Enter)
4. **Manage focus** properly when opening/closing
5. **Use appropriate color contrast** for text and backgrounds
6. **Provide loading states** and error messages

## Performance Considerations

1. **Lazy load heavy modals** using dynamic imports
2. **Reset state appropriately** to prevent memory leaks  
3. **Use callback dependencies carefully** in useEffect
4. **Optimize re-renders** with useMemo/useCallback where needed
5. **Clean up event listeners** in useEffect cleanup

## File Organization

```
src/components/modals/
├── confirmation/           # Simple confirmation dialogs
│   ├── ConfirmDialog.tsx
│   └── ConfirmRecalculateModal.tsx
├── forms/                 # Complex form modals  
│   ├── AddOrEditEventModal.tsx
│   ├── AddOrEditExpenseModal.tsx
│   └── AddOrEditCategoryModal.tsx
├── utility/               # Utility modals
│   ├── ImageCropModal.tsx
│   └── ExportDataModal.tsx
└── account/              # Account-related modals
    ├── DeleteAccountModal.tsx
    └── ChangePasswordModal.tsx
```

## Testing Recommendations

1. **Test modal open/close** behavior
2. **Test form validation** with invalid inputs
3. **Test keyboard navigation** and accessibility
4. **Test loading states** and error handling
5. **Test responsive behavior** across screen sizes

## When to Use Each Pattern

### Use Fullscreen Modals when:
- Complex forms with multiple sections
- File uploads or rich content editing
- Long workflows that need space
- Mobile-first responsive design is critical

### Use Dialog Modals when:
- Simple confirmations or alerts
- Quick data entry (1-3 fields)
- Yes/No decisions
- Lightweight interactions

### Use HeadlessUI Modals when:
- Need advanced animations
- Complex state transitions
- Maximum accessibility compliance
- Integration with existing HeadlessUI components

---

This documentation should be updated as new modal patterns emerge or existing patterns evolve. Always consider consistency with the existing codebase when implementing new modals.