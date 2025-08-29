# Progress Indicator Pattern for Confirmation Modals

This document outlines the standardized pattern for implementing progress indicators in confirmation modals across the application.

## Pattern Overview

This pattern provides visual feedback during async operations in confirmation dialogs, preventing user confusion and improving UX.

## Implementation Steps

### 1. Update Modal Component Props

Add `isLoading` prop to the confirmation modal component:

```typescript
interface ConfirmDialogProps {
  // ... existing props
  isLoading?: boolean;
}

export default function ConfirmDialog({
  // ... existing props
  isLoading = false,
}: ConfirmDialogProps) {
  // ... component logic
}
```

### 2. Update Button Styling and Behavior

```typescript
// Confirm button with proper layout and disabled states
<button
  type='button'
  onClick={handleConfirm}
  disabled={isLoading}
  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] ${styles.confirmButton}`}
>
  {isLoading && (
    <svg
      className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
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
  )}
  {confirmText}
</button>

// Cancel button and close button also need disabled state
<button
  onClick={onClose}
  disabled={isLoading}
  className="... disabled:opacity-50"
>
  {cancelText}
</button>
```

### 3. Add Loading State Management

In the parent component using the modal:

```typescript
// State for tracking loading
const [isDeleting, setIsDeleting] = useState(false);

// Store any data needed for navigation before starting operation
const [categoryId, setCategoryId] = useState<string | null>(null);

// Update mutation with proper loading state management
const deleteMutation = useDeleteMutation({
  onSuccess: () => {
    setIsDeleting(false);
    setShowConfirm(false);
    toast.success('Deleted successfully!');
    // Navigate using stored data
    if (categoryId) {
      router.push(`/path/${categoryId}`);
    }
  },
  onError: (error) => {
    setIsDeleting(false);
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete');
    // Don't close modal on error - allow retry
  },
});
```

### 4. Update Confirmation Handler

```typescript
const handleDelete = () => {
  // Store any data needed for post-operation navigation
  setCategoryId(item.category.id);
  setShowConfirm(true);
};

const confirmDelete = async () => {
  if (!user?.uid || !requiredData) {
    return;
  }

  setIsDeleting(true);

  try {
    await deleteMutation.mutateAsync({
      // mutation params
    });
    // Success/error handling is in mutation callbacks
  } catch (error) {
    // Error handling is in mutation callbacks
  }
};
```

### 5. Pass Loading State to Modal

```typescript
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={confirmDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  confirmText="Delete"
  type="danger"
  isLoading={isDeleting}  // ← Add this prop
/>
```

## Key Benefits

- ✅ **Visual Feedback**: Users see spinner indicating operation is in progress
- ✅ **Prevent Double Actions**: All buttons disabled during operation
- ✅ **Consistent Layout**: Button maintains width with `min-w-[80px]` and `inline-flex`
- ✅ **Error Handling**: Modal stays open on error for retry
- ✅ **Data Preservation**: Store navigation data before operation starts

## CSS Classes Required

- `inline-flex items-center justify-center` - Proper button layout
- `min-w-[80px]` - Prevents button width changes
- `disabled:opacity-50 disabled:cursor-not-allowed` - Visual disabled state
- `animate-spin` - Spinner animation

## Existing Implementations

- ✅ `ConfirmRecalculateModal` - Already implemented
- ✅ `ConfirmDialog` (Delete Expense) - Implemented with this pattern

## Next Implementations

Apply this pattern to:
- Delete Attachment confirmations
- Delete Payment confirmations  
- Delete Category confirmations
- Profile Photo removal confirmations
- Any other destructive actions

## Notes

- Always use the mutation's `onSuccess`/`onError` callbacks for state management
- Store navigation data before starting operations to avoid null reference errors
- Keep original button text - only add spinner, don't change text to "Loading..."
- Use consistent spinner SVG across all modals for visual consistency