/**
 * Text utility functions for consistent text handling across the application
 */

export interface TruncateOptions {
  /** Maximum character length before truncating */
  maxLength: number;
  /** Characters to append when text is truncated (default: '...') */
  suffix?: string;
  /** Whether to try to break at word boundaries (default: false) */
  preserveWords?: boolean;
}

/**
 * Truncates text to a specified maximum length with intelligent word boundary preservation
 * 
 * @param text - The text to truncate
 * @param options - Truncation options
 * @returns Truncated text with suffix if truncated
 * 
 * @example
 * ```typescript
 * // Simple character truncation
 * truncateText("Hello World", { maxLength: 8 }) // "Hello..."
 * 
 * // Word-preserving truncation
 * truncateText("Hello World", { maxLength: 8, preserveWords: true }) // "Hello..."
 * 
 * // Custom suffix
 * truncateText("Hello World", { maxLength: 8, suffix: "…" }) // "Hello W…"
 * ```
 */
export function truncateText(text: string, options: TruncateOptions): string {
  const { maxLength, suffix = '...', preserveWords = false } = options;
  
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Calculate available space for text (accounting for suffix length)
  const availableLength = maxLength - suffix.length;
  
  if (availableLength <= 0) {
    return suffix;
  }

  if (preserveWords) {
    const words = text.split(' ');
    
    // If there are multiple words, try to preserve word boundaries
    if (words.length > 1) {
      let result = '';
      for (const word of words) {
        const testResult = result ? `${result} ${word}` : word;
        if (testResult.length <= availableLength) {
          result = testResult;
        } else {
          break;
        }
      }
      
      // If we got at least one complete word, use it
      if (result && result.length > 0 && result !== text) {
        return result + suffix;
      }
    }
  }

  // Fall back to simple character truncation
  return text.substring(0, availableLength) + suffix;
}

/**
 * Convenience function for mobile-friendly text truncation
 * Uses word-preserving truncation by default
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum character length (default: 20)
 * @returns Truncated text optimized for mobile display
 */
export function truncateForMobile(text: string, maxLength: number = 20): string {
  return truncateText(text, { maxLength, preserveWords: true });
}

/**
 * Convenience function for breadcrumb text truncation
 * Optimized for breadcrumb navigation with shorter limits
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum character length (default: 15)
 * @returns Truncated text optimized for breadcrumbs
 */
export function truncateForBreadcrumb(text: string, maxLength: number = 15): string {
  return truncateText(text, { maxLength, preserveWords: true });
}