# Category Management with React Query

This directory contains React Query implementations for budget category management operations.

## Hooks Available

### `useAddCategoryMutation()`
React Query mutation hook for adding new budget categories with automatic cache invalidation.

```tsx
import { useAddCategoryMutation } from '@/hooks/categories';

function CreateCategoryForm() {
  const addCategoryMutation = useAddCategoryMutation({
    onSuccess: (categoryId) => {
      toast.success('Category created successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (formData) => {
    const categoryDto = {
      userId: user.id,
      eventId: currentEvent.id,
      name: formData.name,
      description: formData.description,
      budgettedAmount: parseFloat(formData.budget),
      color: formData.color,
    };

    addCategoryMutation.mutate({ 
      userId: user.id, 
      eventId: currentEvent.id, 
      addCategoryDto: categoryDto 
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={addCategoryMutation.isPending}>
        {addCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
      </button>
    </form>
  );
}
```

### `useFetchCategories()`
React Query hook for fetching all budget categories for an event.

```tsx
import { useFetchCategories } from '@/hooks/categories';

function CategoriesList() {
  const { data: categories, isLoading, error } = useFetchCategories(userId, eventId);

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {categories?.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
```

### `useUpdateCategoryMutation()`
React Query mutation hook for updating existing budget categories.

```tsx
import { useUpdateCategoryMutation } from '@/hooks/categories';

function EditCategoryForm({ category }) {
  const updateCategoryMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      toast.success('Category updated successfully!');
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleUpdate = (formData) => {
    const updateDto = {
      userId: user.id,
      eventId: currentEvent.id,
      categoryId: category.id,
      name: formData.name,
      description: formData.description,
      budgettedAmount: parseFloat(formData.budget),
      color: formData.color,
    };

    updateCategoryMutation.mutate(updateDto);
  };
}
```

### `useDeleteCategoryMutation()`
React Query mutation hook for deleting budget categories.

```tsx
import { useDeleteCategoryMutation } from '@/hooks/categories';

function DeleteCategoryButton({ category }) {
  const deleteCategoryMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate({
        userId: user.id,
        eventId: currentEvent.id,
        categoryId: category.id,
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleteCategoryMutation.isPending}
    >
      {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Features

### Automatic Cache Management
- ✅ Automatic invalidation of related queries
- ✅ Background refetching when data becomes stale
- ✅ Optimistic updates for better UX

### Error Handling
- ✅ Built-in validation for required fields
- ✅ Dependency checking (e.g., categories used by expenses)
- ✅ Proper error messages and logging

### Performance
- ✅ 5-minute cache with background updates
- ✅ Retry logic for failed requests
- ✅ Placeholder data during refetching

## Integration with EventDetailsContext

These hooks are designed to work seamlessly with the EventDetailsContext:

```tsx
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useFetchCategories } from '@/hooks/categories';

function CategoriesSection() {
  const { event } = useEventDetails();
  const { data: categories } = useFetchCategories(userId, event?.id);

  // Categories are automatically available through the context
  return (
    <div>
      {categories?.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
```

## Testing

Each hook is thoroughly tested with comprehensive test suites covering:
- ✅ Success scenarios
- ✅ Error handling
- ✅ Validation logic
- ✅ Cache invalidation
- ✅ Loading states