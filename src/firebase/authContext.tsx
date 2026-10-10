import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  effectiveRole: UserRole;
  isBootstrapAdmin: boolean;
  emailVerified: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    pass: string,
    extraDetails?: { phone?: string; suburb?: string; address?: string }
  ) => Promise<{ verificationSent: boolean }>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  signOut: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['servicewebsites6@gmail.com', 'workplacesheq@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isBootstrapAdmin = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email) : false;
          let userRole: UserRole = isBootstrapAdmin ? 'admin' : 'customer';

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            if (isBootstrapAdmin) {
              userRole = 'admin';
              const adminDocRef = doc(db, 'admins', currentUser.uid);
              await setDoc(
                adminDocRef,
                {
                  userId: currentUser.uid,
                  email: currentUser.email,
                  role: 'admin',
                  createdAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } else {
              userRole = data.role || 'customer';
            }
            setProfile(data);
          } else {
            // Create user profile in Firestore
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Pool Client',
              photoURL: currentUser.photoURL || '',
              role: userRole,
              phone: '',
              suburb: '',
              address: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);

            // If bootstrap admin, also create document in /admins/
            if (isBootstrapAdmin) {
              const adminDocRef = doc(db, 'admins', currentUser.uid);
              await setDoc(adminDocRef, {
                userId: currentUser.uid,
                email: currentUser.email,
                role: 'admin',
                createdAt: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    pass: string,
    extraDetails?: { phone?: string; suburb?: string; address?: string }
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const cleanName = name.trim() || 'Pool Client';

    await updateProfile(cred.user, { displayName: cleanName });

    // Send Firebase email verification link immediately upon signup
    let verificationSent = false;
    try {
      await sendEmailVerification(cred.user);
      verificationSent = true;
    } catch (verifErr) {
      console.warn('Could not send verification email automatically:', verifErr);
    }

    const isBootstrapAdmin = email ? ADMIN_EMAILS.includes(email) : false;
    const initialProfile: UserProfile = {
      id: cred.user.uid,
      email: cred.user.email || email,
      displayName: cleanName,
      photoURL: cred.user.photoURL || '',
      role: isBootstrapAdmin ? 'admin' : 'customer',
      phone: extraDetails?.phone || '',
      suburb: extraDetails?.suburb || '',
      address: extraDetails?.address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userDocRef = doc(db, 'users', cred.user.uid);
    await setDoc(userDocRef, initialProfile);
    setProfile(initialProfile);

    if (isBootstrapAdmin) {
      const adminDocRef = doc(db, 'admins', cred.user.uid);
      await setDoc(adminDocRef, {
        userId: cred.user.uid,
        email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }

    return { verificationSent };
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user currently signed in');
    await sendEmailVerification(auth.currentUser);
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const isVerified = auth.currentUser.emailVerified;
    // Update local user reference to trigger re-renders
    setUser({ ...auth.currentUser });
    return isVerified;
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setRoleOverride(null);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setRoleOverride(newRole);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedFields = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, updatedFields, { merge: true });

      // If displayName or photoURL changed, sync with Firebase Auth user object
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName ?? user.displayName,
          photoURL: data.photoURL ?? user.photoURL,
        });
      }

      setProfile((prev) => (prev ? { ...prev, ...updatedFields } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const isBootstrapAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const baseRole = isBootstrapAdmin ? 'admin' : (profile?.role || 'customer');
  const effectiveRole = roleOverride || baseRole;
  const emailVerified = user ? Boolean(user.emailVerified) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: baseRole,
        effectiveRole,
        isBootstrapAdmin,
        emailVerified,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendVerificationEmail,
        checkEmailVerification,
        signOut,
        switchDemoRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
