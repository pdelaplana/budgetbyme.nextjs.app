import { useReducer, useCallback } from 'react';

/**
 * File upload state management for expense attachments
 * Consolidates multiple file upload states into a single reducer
 */

export interface FileUploadState {
  // Primary file upload (when attachments exist)
  primaryFile: File | null;
  // Empty state file upload (when no attachments exist)
  emptyStateFile: File | null;
  // Upload operation status
  isOperationInProgress: boolean;
  operationType: 'uploading' | 'deleting' | null;
  // Attachment deletion state
  attachmentToDelete: string | null;
  deletingAttachment: string | null;
  showDeleteConfirm: boolean;
}

type FileUploadAction =
  // Primary file upload
  | { type: 'SET_PRIMARY_FILE'; file: File | null }
  | { type: 'CLEAR_PRIMARY_FILE' }
  
  // Empty state file upload
  | { type: 'SET_EMPTY_STATE_FILE'; file: File | null }
  | { type: 'CLEAR_EMPTY_STATE_FILE' }
  
  // Operation status
  | { type: 'START_OPERATION'; operationType: 'uploading' | 'deleting' }
  | { type: 'END_OPERATION' }
  
  // Attachment deletion
  | { type: 'SHOW_DELETE_CONFIRM'; attachmentUrl: string }
  | { type: 'HIDE_DELETE_CONFIRM' }
  | { type: 'START_DELETING'; attachmentUrl: string }
  | { type: 'END_DELETING' }
  
  // Reset all state
  | { type: 'RESET' };

const initialState: FileUploadState = {
  primaryFile: null,
  emptyStateFile: null,
  isOperationInProgress: false,
  operationType: null,
  attachmentToDelete: null,
  deletingAttachment: null,
  showDeleteConfirm: false,
};

function fileUploadReducer(state: FileUploadState, action: FileUploadAction): FileUploadState {
  switch (action.type) {
    case 'SET_PRIMARY_FILE':
      return {
        ...state,
        primaryFile: action.file,
      };
      
    case 'CLEAR_PRIMARY_FILE':
      return {
        ...state,
        primaryFile: null,
      };
      
    case 'SET_EMPTY_STATE_FILE':
      return {
        ...state,
        emptyStateFile: action.file,
      };
      
    case 'CLEAR_EMPTY_STATE_FILE':
      return {
        ...state,
        emptyStateFile: null,
      };
      
    case 'START_OPERATION':
      return {
        ...state,
        isOperationInProgress: true,
        operationType: action.operationType,
      };
      
    case 'END_OPERATION':
      return {
        ...state,
        isOperationInProgress: false,
        operationType: null,
      };
      
    case 'SHOW_DELETE_CONFIRM':
      return {
        ...state,
        attachmentToDelete: action.attachmentUrl,
        showDeleteConfirm: true,
      };
      
    case 'HIDE_DELETE_CONFIRM':
      return {
        ...state,
        attachmentToDelete: null,
        showDeleteConfirm: false,
      };
      
    case 'START_DELETING':
      return {
        ...state,
        deletingAttachment: action.attachmentUrl,
        isOperationInProgress: true,
        operationType: 'deleting',
      };
      
    case 'END_DELETING':
      return {
        ...state,
        deletingAttachment: null,
        attachmentToDelete: null,
        showDeleteConfirm: false,
        isOperationInProgress: false,
        operationType: null,
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

export function useFileUploadState() {
  const [state, dispatch] = useReducer(fileUploadReducer, initialState);

  const actions = {
    // Primary file upload
    setPrimaryFile: useCallback((file: File | null) => {
      dispatch({ type: 'SET_PRIMARY_FILE', file });
    }, []),
    
    clearPrimaryFile: useCallback(() => {
      dispatch({ type: 'CLEAR_PRIMARY_FILE' });
    }, []),

    // Empty state file upload
    setEmptyStateFile: useCallback((file: File | null) => {
      dispatch({ type: 'SET_EMPTY_STATE_FILE', file });
    }, []),
    
    clearEmptyStateFile: useCallback(() => {
      dispatch({ type: 'CLEAR_EMPTY_STATE_FILE' });
    }, []),

    // Operation management
    startOperation: useCallback((operationType: 'uploading' | 'deleting') => {
      dispatch({ type: 'START_OPERATION', operationType });
    }, []),
    
    endOperation: useCallback(() => {
      dispatch({ type: 'END_OPERATION' });
    }, []),

    // Attachment deletion
    showDeleteConfirm: useCallback((attachmentUrl: string) => {
      dispatch({ type: 'SHOW_DELETE_CONFIRM', attachmentUrl });
    }, []),
    
    hideDeleteConfirm: useCallback(() => {
      dispatch({ type: 'HIDE_DELETE_CONFIRM' });
    }, []),
    
    startDeleting: useCallback((attachmentUrl: string) => {
      dispatch({ type: 'START_DELETING', attachmentUrl });
    }, []),
    
    endDeleting: useCallback(() => {
      dispatch({ type: 'END_DELETING' });
    }, []),

    // Reset all state
    reset: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),
  };

  return {
    state,
    actions,
  };
}

export type FileUploadActions = ReturnType<typeof useFileUploadState>['actions'];