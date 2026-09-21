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
} from 'firebase/auth';
import { upsertUserProfile, ensureUserProfile, subscribeUserProfile } from '../services/realtime';

const DEMO_SESSION_KEY = 'skillswap_demo_session';

const buildDemoAccount = (email = 'demo@skillswap.edu') => ({
  user: {
    uid: 'demo-uiu-scholar',
    email,
    displayName: 'Alex Rivera',
    photoURL: null,
    isDemo: true,
  },
  profile: {
    name: 'Alex Rivera',
    email,
    avatarUrl: academicAssets.avatars.alexRivera,
    university: 'Stanford University',
    academicLevel: 'PhD Candidate',
    title: 'PhD Scholar',
    bio: 'Doctoral candidate focusing on high-energy mathematical physics and stochastic modeling.',
    timeCredits: 24.5,
    expertiseAreas: ['Applied Math', 'LaTeX', 'Python', 'Fourier Analysis'],
    learningGoals: ['Game Theory', 'R-Studio', 'CRISPR Data Analysis'],
  },
});

const loadDemoAccount = () => {
  try {
    const email = localStorage.getItem(DEMO_SESSION_KEY);
    if (!email) return null;
    const account = buildDemoAccount(email);
    const cachedProfile = JSON.parse(
      localStorage.getItem('skillswap_profile_demo-uiu-scholar') || 'null'
    );
    return cachedProfile
      ? { ...account, profile: { ...account.profile, ...cachedProfile } }
      : account;
  } catch {
    return null;
  }
};

const clearDemoSession = () => {
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
};

export const AuthProvider = ({ children }) => {
  const [restoredDemo] = useState(loadDemoAccount);
  const [currentUser, setCurrentUser] = useState(restoredDemo?.user || null);
  const [userProfile, setUserProfile] = useState(restoredDemo?.profile || null);
  const [loading, setLoading] = useState(!restoredDemo);
  const demoModeRef = useRef(Boolean(restoredDemo));
  const profileUnsubRef = useRef(null);

  const stopProfileSubscription = () => {
    profileUnsubRef.current?.();
    profileUnsubRef.current = null;
  };

  // Helper to sync profile with localStorage
  const saveProfileLocally = (uid, profileData) => {
    try {
      localStorage.setItem(`skillswap_profile_${uid}`, JSON.stringify(profileData));
    } catch {
      console.warn('Could not cache profile locally');
    }
  };

  const loadProfileLocally = (uid) => {
    try {
      const cached = localStorage.getItem(`skillswap_profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  // Sign up with Email, Password, Name, University
  const signUp = async (email, password, fullName, university) => {
    demoModeRef.current = false;
    clearDemoSession();
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(res.user, { displayName: fullName });
    }

    const initialProfile = {
      name: fullName || res.user.displayName || 'Scholar',
      email: res.user.email,
      avatarUrl: resolveAvatarForName(fullName || res.user.displayName || 'Scholar', academicAssets.avatars.defaultMaleScholar),
      university: university || 'United International University (UIU)',
      academicLevel: 'BSc in Computer Science & Engineering',
      bio: 'Undergraduate scholar passionate about peer knowledge exchange.',
      timeCredits: 24.5,
      expertiseAreas: ['Data Structures', 'Algorithms', 'C++', 'Python'],
      learningGoals: ['Machine Learning', 'Artificial Intelligence', 'Cloud Systems'],
    };

    saveProfileLocally(res.user.uid, initialProfile);
    upsertUserProfile(res.user.uid, initialProfile).catch((e) => {
      console.warn('Could not sync profile to Firestore:', e);
    });
    setUserProfile(initialProfile);
    return { user: res.user, profile: initialProfile };
  };

  // Demo Scholar Account Sign In
  const loginAsDemo = async (demoEmail = 'demo@skillswap.edu') => {
    demoModeRef.current = true;
    const { user: demoUser, profile: demoProfile } = buildDemoAccount(demoEmail);
    try {
      localStorage.setItem(DEMO_SESSION_KEY, demoEmail);
    } catch {
      // The in-memory demo still works when persistent storage is unavailable.
    }
    saveProfileLocally('demo-uiu-scholar', demoProfile);
    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    return { user: demoUser, profile: demoProfile };
  };

  // Sign in with Email & Password
  const signIn = async (email, password) => {
    // Instant bypass for demo account
    if (
      email.toLowerCase() === 'unknown@bscse.uiu.ac.bd' ||
      email.toLowerCase() === 'demo@skillswap.edu' ||
      email.toLowerCase().includes('demo')
    ) {
      return loginAsDemo(email);
    }

    demoModeRef.current = false;
    clearDemoSession();
    const res = await signInWithEmailAndPassword(auth, email, password);
    const existing = loadProfileLocally(res.user.uid);
    const profile = existing || {
      name: res.user.displayName || email.split('@')[0],
      email: res.user.email,
      avatarUrl: resolveAvatarForName(res.user.displayName || email.split('@')[0], academicAssets.avatars.defaultMaleScholar),
      university: 'United International University (UIU)',
      timeCredits: 24.5,
    };
    setUserProfile(profile);
    // Prefer the Firestore profile as source of truth; never overwrite newer
    // server data with a stale local cache (ensureUserProfile only creates if
    // the document doesn't exist yet).
    ensureUserProfile(res.user.uid, profile)
      .then((dbProfile) => {
        if (dbProfile) {
          setUserProfile(dbProfile);
          saveProfileLocally(res.user.uid, dbProfile);
        }
      })
      .catch((e) => {
        console.warn('Could not sync profile to Firestore:', e);
      });
    return { user: res.user, profile };
  };

  // Google OAuth Sign In
  const signInWithGoogleOAuth = async () => {
    demoModeRef.current = false;
    clearDemoSession();
    const res = await signInWithPopup(auth, googleProvider);
    const existing = loadProfileLocally(res.user.uid);
    const profile = existing || {
      name: res.user.displayName || 'Scholar',
      email: res.user.email,
      avatarUrl: res.user.photoURL || resolveAvatarForName(res.user.displayName || 'Scholar', academicAssets.avatars.defaultMaleScholar),
      university: 'United International University (UIU)',
      academicLevel: 'BSc in Computer Science & Engineering',
      timeCredits: 24.5,
      expertiseAreas: ['Data Structures', 'Algorithms'],
      learningGoals: ['Machine Learning'],
    };
    let resolvedProfile = profile;
    try {
      resolvedProfile = (await ensureUserProfile(res.user.uid, profile)) || profile;
    } catch (error) {
      console.warn('Could not sync profile to Firestore:', error);
    }
    saveProfileLocally(res.user.uid, resolvedProfile);
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
      saveProfileLocally(currentUser.uid, merged);
      if (!currentUser?.isDemo) {
        await upsertUserProfile(currentUser.uid, merged);
      }
    }
    return merged;
  };

  // Log Out
  const logOut = async () => {
    demoModeRef.current = false;
    clearDemoSession();
    // Firestore rules require authentication to read profiles. Stop the live
    // listener before revoking Firebase Auth so it cannot emit a harmless
    // permission-denied error during logout.
    stopProfileSubscription();
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch {
      // ignore if demo user
    }
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
        // Firebase still reports an anonymous user while the local demo is
        // active. Never let that delayed callback wipe the demo session.
        if (demoModeRef.current) {
          setLoading(false);
          return;
        }

        // Authentication may move directly from one account to another.
        // Never leave the previous account's profile listener running.
        stopProfileSubscription();
        setCurrentUser(user);
        if (user) {
          const fallbackName = user.displayName || user.email?.split('@')[0] || 'Scholar';
          const fallbackProfile = {
            name: fallbackName,
            email: user.email,
            avatarUrl: user.photoURL || resolveAvatarForName(fallbackName, academicAssets.avatars.defaultMaleScholar),
            university: 'United International University (UIU)',
            academicLevel: 'BSc in Computer Science & Engineering',
            timeCredits: 24.5,
          };
          const cached = loadProfileLocally(user.uid);
          const local = cached || fallbackProfile;
          setUserProfile(local);

          // Create the Firestore doc if it doesn't exist (never overwrites).
          ensureUserProfile(user.uid, local).then((dbProfile) => {
            if (dbProfile) setUserProfile(dbProfile);
          }).catch((e) => console.warn('Profile ensure/sync:', e));

          // Live-sync profile from Firestore.
          profileUnsubRef.current = subscribeUserProfile(user.uid, (p) => {
            if (p) setUserProfile(p);
          });
        } else {
          setUserProfile(null);
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
    loading,
    // Method names expected by user's components
    signIn,
    signUp,
    signInWithGoogleOAuth,
    loginAsDemo,
    signInAsDemo: loginAsDemo,
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
