'use client';

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { setupUserWorkspace } from '@/server/actions/setupUserWorkspace';
import { CurrencyImplementation } from '@/types/currencies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: ({
    displayName,
    photoURL,
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // Set up user workspace
      await setupUserWorkspace({
        userId: userCredential.user.uid,
        email,
        name: fullName,
        preferences: {
          language: 'en',
          currency: CurrencyImplementation.USD.code,
        },
      });

      // Update local state to reflect the new display name
      setUser({ ...userCredential.user, displayName: fullName } as User);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirect to sign-in page immediately after successful sign out
      window.location.href = '/signin';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        const noUserError = new Error('No authenticated user found');
        (noUserError as any).code = 'auth/user-not-found';
        throw noUserError;
      }

      // Create credential for reauthentication
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      // Reauthenticate the user first
      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
      } catch (reauthError: any) {
        // Re-throw with more specific error context
        console.error('Reauthentication failed:', reauthError);
        throw reauthError;
      }

      // Update password after successful reauthentication
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (updateError: any) {
        // Re-throw with more specific error context
        console.error('Password update failed:', updateError);
        throw updateError;
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      // Preserve the original Firebase error code and message
      throw error;
    }
  };

  const updateUserProfile = async ({
    displayName,
    photoURL,
  }: {
    displayName?: string | null;
    photoURL?: string | null;
  }) => {
    try {
      const profile: { displayName?: string | null; photoURL?: string | null } =
        {};

      // Handle displayName - include if provided (even if null to clear it)
      if (displayName !== undefined) {
        profile.displayName = displayName;
      }

      // Handle photoURL - include if provided (even if null to clear it)
      if (photoURL !== undefined) {
        profile.photoURL = photoURL;
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, profile);
        // Force refresh of the user object to reflect changes

        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut: handleSignOut,
    resetPassword,
    signInWithGoogle,
    changePassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
