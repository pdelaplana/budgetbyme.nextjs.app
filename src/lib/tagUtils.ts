/**
 * Utility functions for tag management
 * Provides validation, manipulation, and state management for expense tags
 */

export interface TagValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a tag for addition
 */
export function validateTag(
  tag: string,
  existingTags: string[],
): TagValidationResult {
  const trimmedTag = tag.trim();

  if (!trimmedTag) {
    return { isValid: false, error: 'Tag cannot be empty' };
  }

  if (trimmedTag.length > 15) {
    return { isValid: false, error: 'Tag cannot exceed 15 characters' };
  }

  if (existingTags.includes(trimmedTag)) {
    return { isValid: false, error: 'Tag already exists' };
  }

  return { isValid: true };
}

/**
 * Adds a new tag to the existing tags array
 * Returns the updated tags array or null if invalid
 */
export function addTag(currentTags: string[], newTag: string): string[] | null {
  const validation = validateTag(newTag, currentTags);

  if (!validation.isValid) {
    return null;
  }

  return [...currentTags, newTag.trim()];
}

/**
 * Removes a tag from the tags array
 */
export function removeTag(
  currentTags: string[],
  tagToRemove: string,
): string[] {
  return currentTags.filter((tag) => tag !== tagToRemove);
}

/**
 * Checks if a tag exists in the tags array
 */
export function tagExists(tags: string[], tag: string): boolean {
  return tags.includes(tag.trim());
}

/**
 * Formats tags for display with proper truncation
 */
export function formatTagForDisplay(
  tag: string,
  maxLength: number = 80,
): string {
  if (tag.length <= maxLength) {
    return tag;
  }

  return `${tag.substring(0, maxLength - 3)}...`;
}

/**
 * Sanitizes tag input by trimming and removing invalid characters
 */
export function sanitizeTagInput(input: string): string {
  return input
    .trim()
    .replace(/[^\w\s-]/g, '') // Allow only word characters, spaces, and hyphens
    .substring(0, 15); // Enforce max length
}

/**
 * Tag state management interface
 */
export interface TagState {
  tags: string[];
  isEditing: boolean;
  newTag: string;
}

/**
 * Tag action types
 */
export type TagAction =
  | { type: 'SET_TAGS'; tags: string[] }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'SET_NEW_TAG'; tag: string }
  | { type: 'TOGGLE_EDITING' }
  | { type: 'START_EDITING' }
  | { type: 'STOP_EDITING' }
  | { type: 'RESET_NEW_TAG' };

/**
 * Tag state reducer
 */
export function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case 'SET_TAGS':
      return {
        ...state,
        tags: action.tags,
      };

    case 'ADD_TAG': {
      const updatedTags = addTag(state.tags, action.tag);
      if (updatedTags === null) {
        return state; // Invalid tag, don't update
      }
      return {
        ...state,
        tags: updatedTags,
        newTag: '', // Clear input after adding
      };
    }

    case 'REMOVE_TAG':
      return {
        ...state,
        tags: removeTag(state.tags, action.tag),
      };

    case 'SET_NEW_TAG':
      return {
        ...state,
        newTag: sanitizeTagInput(action.tag),
      };

    case 'TOGGLE_EDITING':
      return {
        ...state,
        isEditing: !state.isEditing,
        newTag: state.isEditing ? '' : state.newTag, // Clear input when stopping editing
      };

    case 'START_EDITING':
      return {
        ...state,
        isEditing: true,
      };

    case 'STOP_EDITING':
      return {
        ...state,
        isEditing: false,
        newTag: '', // Clear input when stopping editing
      };

    case 'RESET_NEW_TAG':
      return {
        ...state,
        newTag: '',
      };

    default:
      return state;
  }
}

/**
 * Initial tag state
 */
export const initialTagState: TagState = {
  tags: [],
  isEditing: false,
  newTag: '',
};
