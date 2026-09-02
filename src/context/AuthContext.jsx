import React, { createContext, useContext, useEffect, useState } from 'react';
import { academicAssets, resolveAvatarForName } from '../assets';
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

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync profile with localStorage
  const saveProfileLocally = (uid, profileData) => {
    try {
      localStorage.setItem(`skillswap_profile_${uid}`, JSON.stringify(profileData));
    } catch (e) {
      console.warn('Could not cache profile locally', e);
    }
  };

  const loadProfileLocally = (uid) => {
    try {
      const cached = localStorage.getItem(`skillswap_profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  // Sign up with Email, Password, Name, University
  const signUp = async (email, password, fullName, university) => {
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
    setUserProfile(initialProfile);
    return { user: res.user, profile: initialProfile };
  };

  // Demo Scholar Account Sign In
  const loginAsDemo = async (demoEmail = 'unknown@bscse.uiu.ac.bd') => {
    const demoUser = {
      uid: 'demo-uiu-scholar',
      email: demoEmail,
      displayName: 'Unknown',
      photoURL: null,
      isDemo: true,
    };
    const demoProfile = {
      name: 'Unknown',
      email: demoEmail,
      avatarUrl: resolveAvatarForName('Unknown', academicAssets.avatars.defaultMaleScholar),
      university: 'United International University (UIU)',
      academicLevel: 'BSc in Computer Science & Engineering',
      bio: 'UIU Student Scholar (Demo Account)',
      timeCredits: 24.5,
      expertiseAreas: ['Data Structures', 'Algorithms', 'C++', 'Python'],
      learningGoals: ['Machine Learning', 'Artificial Intelligence', 'Cloud Systems'],
    };
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
    return { user: res.user, profile };
  };

  // Google OAuth Sign In
  const signInWithGoogleOAuth = async () => {
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
    saveProfileLocally(res.user.uid, profile);
    setUserProfile(profile);
    return { user: res.user, profile };
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
    }
    return merged;
  };

  // Log Out
  const logOut = async () => {
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      // ignore if demo user
    }
  };

  // Watch Auth State
  useEffect(() => {
    // Safety fallback: Never leave the screen in loading state for more than 800ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timer);
        if (currentUser?.isDemo) {
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        if (user) {
          const cached = loadProfileLocally(user.uid);
          const fallbackName = user.displayName || user.email?.split('@')[0] || 'Scholar';
          setUserProfile(
            cached || {
              name: fallbackName,
              email: user.email,
              avatarUrl: user.photoURL || resolveAvatarForName(fallbackName, academicAssets.avatars.defaultMaleScholar),
              university: 'United International University (UIU)',
              academicLevel: 'BSc in Computer Science & Engineering',
              timeCredits: 24.5,
            }
          );
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
    };
  }, [currentUser?.isDemo]);

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