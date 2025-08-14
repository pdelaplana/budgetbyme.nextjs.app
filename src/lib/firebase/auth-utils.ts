import type { FirebaseError } from 'firebase/app'

export interface AuthError {
  code: string
  message: string
}

/**
 * Converts Firebase auth errors to user-friendly messages
 */
export function getAuthErrorMessage(error: FirebaseError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.'

    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'

    case 'auth/invalid-email':
      return 'Please enter a valid email address.'

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'

    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.'

    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'

    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.'

    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'

    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action.'

    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.'

    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.'

    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.'

    default:
      console.error('Unhandled auth error:', error.code, error.message)
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

export function getPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add at least one lowercase letter')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add at least one uppercase letter')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add at least one number')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add at least one special character')
  }

  const isValid = score >= 4 // Require at least 4 out of 5 criteria

  return {
    score,
    feedback,
    isValid,
  }
}

/**
 * Formats display name from user input
 */
export function formatDisplayName(name: string): string {
  return name
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
