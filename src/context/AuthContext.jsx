import React, { useEffect, useRef, useState } from 'react';
import { academicAssets, resolveAvatarForName } from '../assets';
import { AuthContext } from './auth';
import { auth, googleProvider } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  getIdTokenResult,
} from 'firebase/auth';
import {
  upsertUserProfile,
  ensureUserProfile,
  subscribeUserProfile,
  updateUserPresence,
} from '../services/realtime';

const newProfile = (user, overrides = {}) => {
  const name = overrides.name || user.displayName || user.email?.split('@')[0] || 'Scholar';
  return {
    name,
    avatarUrl:
      overrides.avatarUrl ||
      user.photoURL ||
      resolveAvatarForName(name, academicAssets.avatars.defaultMaleScholar),
    university: overrides.university || '',
    academicLevel: '',
    title: '',
    bio: '',
    skillsTeach: [],
    skillsWant: [],
    expertiseAreas: [],
    learningGoals: [],
    timeCredits: 0,
    creditsEarned: 0,
    creditsSpent: 0,
    completedSwaps: 0,
    ratingCount: 0,
    ratingSum: 0,
    ratingAverage: 0,
    achievementBadges: [],
    ...overrides,
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileUnsubRef = useRef(null);

  const stopProfileSubscription = () => {
    profileUnsubRef.current?.();
    profileUnsubRef.current = null;
  };

  // Sign up with Email, Password, Name, University
  const signUp = async (email, password, fullName, university) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(res.user, { displayName: fullName });
    }

    const initialProfile = newProfile(res.user, {
      name: fullName || res.user.displayName || 'Scholar',
      university: university || '',
    });
    await upsertUserProfile(res.user.uid, initialProfile);
    setUserProfile(initialProfile);
    return { user: res.user, profile: initialProfile };
  };

  // Sign in with Email & Password
  const signIn = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const profile = newProfile(res.user);
    setUserProfile(profile);
    ensureUserProfile(res.user.uid, profile)
      .then((dbProfile) => {
        if (dbProfile) setUserProfile(dbProfile);
      })
      .catch((e) => {
        console.warn('Could not sync profile to Firestore:', e);
      });
    return { user: res.user, profile };
  };

  // Google OAuth Sign In
  const signInWithGoogleOAuth = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const profile = newProfile(res.user);
    let resolvedProfile = profile;
    try {
      resolvedProfile = (await ensureUserProfile(res.user.uid, profile)) || profile;
    } catch (error) {
      console.warn('Could not sync profile to Firestore:', error);
    }
    setUserProfile(resolvedProfile);
    return { user: res.user, profile: resolvedProfile };
  };

  // Send Password Reset Email
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update Profile Data
  const updateProfileData = async (updatedData) => {
    const merged = { ...userProfile, ...updatedData };
    setUserProfile(merged);
    if (currentUser?.uid) {
      await upsertUserProfile(currentUser.uid, merged);
    }
    return merged;
  };

  // Log Out
  const logOut = async () => {
    // Firestore rules require authentication to read profiles. Stop the live
    // listener before revoking Firebase Auth so it cannot emit a harmless
    // permission-denied error during logout.
    stopProfileSubscription();
    if (currentUser?.uid) {
      await updateUserPresence(currentUser.uid, false).catch(() => {});
    }
    setUserProfile(null);
    setCurrentUser(null);
    setIsAdmin(false);
    await signOut(auth);
  };

  // Watch Auth State + sync real profiles to Firestore
  useEffect(() => {
    // Safety fallback: Never leave the screen in loading state for more than 800ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timer);
        // Authentication may move directly from one account to another.
        // Never leave the previous account's profile listener running.
        stopProfileSubscription();
        setCurrentUser(user);
        if (user) {
          const fallbackProfile = newProfile(user);
          setUserProfile(fallbackProfile);
          getIdTokenResult(user)
            .then((token) => setIsAdmin(token.claims.admin === true))
            .catch(() => setIsAdmin(false));

          // Create the Firestore doc if it doesn't exist (never overwrites).
          ensureUserProfile(user.uid, fallbackProfile).then((dbProfile) => {
            if (dbProfile) setUserProfile(dbProfile);
            return updateUserPresence(user.uid, true);
          }).catch((e) => console.warn('Profile ensure/sync:', e));

          // Live-sync profile from Firestore.
          profileUnsubRef.current = subscribeUserProfile(user.uid, (p) => {
            if (p) setUserProfile(p);
          });
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase auth notice:', error);
        clearTimeout(timer);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
      stopProfileSubscription();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    // Method names expected by user's components
    signIn,
    signUp,
    signInWithGoogleOAuth,
    logOut,
    resetPassword,
    updateProfileData,
    // Aliases
    login: signIn,
    signup: signUp,
    logout: logOut,
    loginWithGoogle: signInWithGoogleOAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
          <div className="w-8 h-8 border-4 border-[#675975] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
