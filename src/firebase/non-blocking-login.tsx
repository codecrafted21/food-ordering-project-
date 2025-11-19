'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate email/password sign-in (non-blocking).
 * If the user does not exist, it attempts to create a new user with the same credentials.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error) => {
      // If sign-in fails because the user doesn't exist, try creating a new account.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log("User not found, attempting to create a new account...");
        initiateEmailSignUp(authInstance, email, password);
      } else {
        // For other errors (like wrong password for an existing user), we can log them.
        // In a production app, you might show a specific error toast.
        console.error("Sign-in error:", error);
      }
    });
}
