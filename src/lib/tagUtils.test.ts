import { describe, expect, it } from 'vitest';
import type { TagAction, TagState } from './tagUtils';
import {
  addTag,
  initialTagState,
  removeTag,
  sanitizeTagInput,
  tagReducer,
  validateTag,
} from './tagUtils';

describe('tagUtils', () => {
  describe('sanitizeTagInput', () => {
    it('should trim whitespace from tag input', () => {
      expect(sanitizeTagInput('  tag  ')).toBe('tag');
    });

    it('should remove special characters but keep word chars and hyphens', () => {
      expect(sanitizeTagInput('tag@#$')).toBe('tag');
      expect(sanitizeTagInput('tag-name_123')).toBe('tag-name_123');
    });

    it('should enforce max length of 15 characters', () => {
      expect(sanitizeTagInput('this-is-a-very-long-tag-name')).toBe(
        'this-is-a-very-',
      );
    });

    it('should handle empty and whitespace-only strings', () => {
      expect(sanitizeTagInput('')).toBe('');
      expect(sanitizeTagInput('   ')).toBe('');
    });
  });

  describe('validateTag', () => {
    const existingTags = ['existing', 'another', 'third'];

    it('should return error for empty tag', () => {
      const result = validateTag('', existingTags);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Tag cannot be empty');
    });

    it('should return error for tag that is too long', () => {
      const longTag = 'a'.repeat(16);
      const result = validateTag(longTag, existingTags);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Tag cannot exceed 15 characters');
    });

    it('should return error for duplicate tag', () => {
      const result = validateTag('existing', existingTags);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Tag already exists');
    });

    it('should return valid for tags with allowed characters', () => {
      const result = validateTag('tag-name_123', existingTags);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for good tag', () => {
      const result = validateTag('new-tag_123', existingTags);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle exact duplicates only (case-sensitive)', () => {
      const result = validateTag('EXISTING', existingTags);
      expect(result.isValid).toBe(true); // Case sensitive, so EXISTING != existing
    });
  });

  describe('addTag', () => {
    it('should add valid tag to empty array', () => {
      const result = addTag([], 'new-tag');
      expect(result).toEqual(['new-tag']);
    });

    it('should add valid tag to existing array', () => {
      const result = addTag(['existing'], 'new-tag');
      expect(result).toEqual(['existing', 'new-tag']);
    });

    it('should reject invalid tag and return null', () => {
      const result = addTag(['existing'], '');
      expect(result).toBeNull();
    });

    it('should reject duplicate tag and return null', () => {
      const result = addTag(['existing'], 'existing');
      expect(result).toBeNull();
    });

    it('should trim tag before adding', () => {
      const result = addTag(['existing'], '  new-tag  ');
      expect(result).toEqual(['existing', 'new-tag']);
    });
  });

  describe('removeTag', () => {
    it('should remove existing tag', () => {
      const result = removeTag(['first', 'second', 'third'], 'second');
      expect(result).toEqual(['first', 'third']);
    });

    it('should handle non-existing tag gracefully', () => {
      const result = removeTag(['first', 'second'], 'nonexistent');
      expect(result).toEqual(['first', 'second']);
    });

    it('should handle empty array', () => {
      const result = removeTag([], 'any');
      expect(result).toEqual([]);
    });

    it('should handle case-sensitive removal', () => {
      const result = removeTag(['First', 'second'], 'first');
      expect(result).toEqual(['First', 'second']);
    });
  });

  describe('tagReducer', () => {
    it('should handle SET_TAGS action', () => {
      const action: TagAction = { type: 'SET_TAGS', tags: ['tag1', 'tag2'] };
      const newState = tagReducer(initialTagState, action);
      expect(newState.tags).toEqual(['tag1', 'tag2']);
      expect(newState.isEditing).toBe(false);
    });

    it('should handle ADD_TAG action with valid tag', () => {
      const initialState: TagState = {
        ...initialTagState,
        tags: ['existing'],
        newTag: 'new-tag',
      };
      const action: TagAction = { type: 'ADD_TAG', tag: 'new-tag' };
      const newState = tagReducer(initialState, action);

      expect(newState.tags).toEqual(['existing', 'new-tag']);
      expect(newState.newTag).toBe('');
      expect(newState.isEditing).toBe(false);
    });

    it('should handle ADD_TAG action with invalid tag', () => {
      const initialState: TagState = {
        ...initialTagState,
        tags: ['existing'],
        newTag: 'existing',
      };
      const action: TagAction = { type: 'ADD_TAG', tag: 'existing' };
      const newState = tagReducer(initialState, action);

      expect(newState.tags).toEqual(['existing']);
      expect(newState.newTag).toBe('existing'); // newTag should remain unchanged when add fails
    });

    it('should handle REMOVE_TAG action', () => {
      const initialState: TagState = {
        ...initialTagState,
        tags: ['tag1', 'tag2', 'tag3'],
      };
      const action: TagAction = { type: 'REMOVE_TAG', tag: 'tag2' };
      const newState = tagReducer(initialState, action);

      expect(newState.tags).toEqual(['tag1', 'tag3']);
    });

    it('should handle SET_NEW_TAG action', () => {
      const action: TagAction = { type: 'SET_NEW_TAG', tag: 'new input' };
      const newState = tagReducer(initialTagState, action);

      expect(newState.newTag).toBe('new input');
      expect(newState.error).toBeUndefined();
    });

    it('should handle TOGGLE_EDITING action', () => {
      const action: TagAction = { type: 'TOGGLE_EDITING' };
      let newState = tagReducer(initialTagState, action);
      expect(newState.isEditing).toBe(true);

      newState = tagReducer(newState, action);
      expect(newState.isEditing).toBe(false);
    });

    it('should handle STOP_EDITING action', () => {
      const initialState: TagState = {
        ...initialTagState,
        isEditing: true,
        newTag: 'some input',
      };
      const action: TagAction = { type: 'STOP_EDITING' };
      const newState = tagReducer(initialState, action);

      expect(newState.isEditing).toBe(false);
      expect(newState.newTag).toBe('');
      expect(newState.error).toBeUndefined();
    });

    it('should sanitize input when setting new tag', () => {
      const initialState: TagState = {
        ...initialTagState,
      };
      const action: TagAction = { type: 'SET_NEW_TAG', tag: 'new@#$tag' };
      const newState = tagReducer(initialState, action);

      expect(newState.newTag).toBe('newtag'); // Special chars removed by sanitizeTagInput
    });
  });

  describe('initialTagState', () => {
    it('should have correct initial values', () => {
      expect(initialTagState).toEqual({
        tags: [],
        newTag: '',
        isEditing: false,
      });
    });
  });
});
