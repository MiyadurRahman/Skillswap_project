// import { initializeApp } from 'firebase/app';
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
//   signOut,
//   onAuthStateChanged,
//   updateProfile,
//   sendPasswordResetEmail,
// } from 'firebase/auth';
// import {
//   getFirestore,
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   onSnapshot,
// } from 'firebase/firestore';

// import firebaseConfig from '../firebase-applet-config.json';

// // Initialize Firebase App
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication
// export const auth = getAuth(app);

// // Initialize Firestore (utilizing custom databaseId if configured)
// export const db = firebaseConfig.firestoreDatabaseId
//   ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
//   : getFirestore(app);

// // Google Auth Provider
// export const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({
//   prompt: 'select_account',
// });

// /**
//  * Format Firebase Auth Error messages to be human-friendly
//  */
// export function getFriendlyAuthErrorMessage(error) {
//   if (!error) return 'An unknown error occurred.';
//   const code = error.code || '';
//   switch (code) {
//     case 'auth/invalid-email':
//       return 'The email address format is invalid.';
//     case 'auth/user-disabled':
//       return 'This scholar account has been disabled.';
//     case 'auth/user-not-found':
//     case 'auth/invalid-credential':
//       return 'Incorrect email or password. Please verify and try again.';
//     case 'auth/wrong-password':
//       return 'Incorrect password. Please try again or reset your password.';
//     case 'auth/email-already-in-use':
//       return 'An account with this email already exists. Please sign in instead.';
//     case 'auth/weak-password':
//       return 'Password should be at least 6 characters long.';
//     case 'auth/popup-closed-by-user':
//       return 'Sign-in popup was closed before completing authentication.';
//     case 'auth/popup-blocked':
//       return 'Popup was blocked by your browser. Please allow popups for this site.';
//     case 'auth/network-request-failed':
//       return 'Network request failed. Please check your internet connection.';
//     case 'auth/operation-not-allowed':
//       return 'This authentication method is currently not enabled.';
//     default:
//       return error.message || 'Authentication error occurred.';
//   }
// }

// /**
//  * Sign up a new user with Email and Password
//  */
// export async function registerWithEmail(email, password, fullName, university = 'Stanford University') {
//   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//   const user = userCredential.user;

//   if (fullName) {
//     try {
//       await updateProfile(user, {
//         displayName: fullName,
//       });
//     } catch (e) {
//       console.warn('Update displayName warning:', e);
//     }
//   }

//   // Create initial Firestore profile for the new user
//   const initialProfile = {
//     userId: user.uid,
//     fullName: fullName || 'Academic Scholar',
//     email: user.email,
//     university: university || 'Stanford University',
//     academicLevel: 'PhD Candidate',
//     title: 'Research Scholar',
//     timeCredits: 20, // Free starter credit balance
//     skillsOffered: ['Applied Math', 'Python', 'LaTeX'],
//     skillsToLearn: ['Machine Learning', 'Data Analysis'],
//     bio: 'Doctoral researcher interested in peer skill exchange and collaborative research.',
//     avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };

//   try {
//     await setDoc(doc(db, 'users', user.uid), initialProfile, { merge: true });
//   } catch (err) {
//     console.warn('Initial profile doc save note:', err);
//   }

//   return { user, profile: initialProfile };
// }

// /**
//  * Sign in with Email and Password (with seamless auto-registration fallback for demo/new accounts)
//  */
// export async function loginWithEmail(email, password) {
//   let userCredential;
//   try {
//     userCredential = await signInWithEmailAndPassword(auth, email, password);
//   } catch (err) {
//     const isDemoOrUiu =
//       email.includes('uiu.ac.bd') ||
//       email === 'unknown@bscse.uiu.ac.bd' ||
//       email === 'scholar.alex@stanford.edu';

//     // If user doesn't exist yet, auto-register them seamlessly
//     if (
//       err.code === 'auth/user-not-found' ||
//       err.code === 'auth/invalid-credential' ||
//       isDemoOrUiu
//     ) {
//       try {
//         const uiuName = isDemoOrUiu ? 'Unknown (UIU Scholar)' : email.split('@')[0];
//         const uiuUni = isDemoOrUiu ? 'United International University (UIU)' : 'Stanford University';
//         return await registerWithEmail(email, password, uiuName, uiuUni);
//       } catch (regErr) {
//         // If registration also fails (e.g. email in use with diff pass or offline), rethrow original or friendly message
//         if (regErr.code !== 'auth/email-already-in-use') {
//           throw regErr;
//         }
//       }
//     }
//     throw err;
//   }

//   const user = userCredential.user;
//   let profile = await getUserProfile(user.uid);
//   if (!profile) {
//     const isUiu = email.includes('uiu.ac.bd');
//     profile = {
//       userId: user.uid,
//       fullName: user.displayName || (isUiu ? 'Unknown (UIU Scholar)' : user.email?.split('@')[0] || 'Scholar'),
//       email: user.email,
//       university: isUiu ? 'United International University (UIU)' : 'Stanford University',
//       academicLevel: isUiu ? 'BSc in Computer Science & Engineering' : 'Graduate Scholar',
//       title: 'Research Scholar',
//       timeCredits: 20,
//       skillsOffered: isUiu ? ['Algorithms', 'Data Structures', 'C++', 'Python'] : ['Applied Math', 'Python', 'LaTeX'],
//       skillsToLearn: isUiu ? ['Machine Learning', 'Artificial Intelligence', 'Cloud Computing'] : ['Data Science', 'Machine Learning'],
//       bio: isUiu ? 'Undergraduate researcher in Computer Science at United International University.' : 'Doctoral researcher in academic skill exchange.',
//       avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     try {
//       await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
//     } catch (e) {
//       console.warn('Doc set warning:', e);
//     }
//   }
//   return { user, profile };
// }

// /**
//  * Sign in / Sign up with Google OAuth
//  */
// export async function loginWithGoogle() {
//   const result = await signInWithPopup(auth, googleProvider);
//   const user = result.user;

//   let profile = await getUserProfile(user.uid);
//   if (!profile) {
//     profile = {
//       userId: user.uid,
//       fullName: user.displayName || 'Google Scholar',
//       email: user.email,
//       university: 'Institutional Partner',
//       academicLevel: 'Graduate Researcher',
//       title: 'Visiting Scholar',
//       timeCredits: 25,
//       skillsOffered: ['Research Methods', 'Data Synthesis'],
//       skillsToLearn: ['Statistical Modeling', 'Scientific Writing'],
//       bio: 'Inter-university scholar collaborating through institutional authentication.',
//       avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     try {
//       await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
//     } catch (e) {
//       console.warn('Google profile creation note:', e);
//     }
//   }

//   return { user, profile };
// }

// /**
//  * Sign out current user
//  */
// export async function logoutUser() {
//   await signOut(auth);
// }

// /**
//  * Send password reset email
//  */
// export async function resetUserPassword(email) {
//   await sendPasswordResetEmail(auth, email);
// }

// /**
//  * Fetch user profile from Firestore
//  */
// export async function getUserProfile(userId) {
//   if (!userId) return null;
//   try {
//     const userDocRef = doc(db, 'users', userId);
//     const docSnap = await getDoc(userDocRef);
//     if (docSnap.exists()) {
//       return docSnap.data();
//     }
//   } catch (e) {
//     console.error('Error fetching user profile:', e);
//   }
//   return null;
// }

// /**
//  * Save / update user profile in Firestore
//  */
// export async function saveUserProfile(userId, data) {
//   if (!userId) return;
//   const userDocRef = doc(db, 'users', userId);
//   const updatedData = {
//     ...data,
//     updatedAt: new Date().toISOString(),
//   };
//   await setDoc(userDocRef, updatedData, { merge: true });
//   return updatedData;
// }

// /**
//  * Listen to realtime auth state changes
//  */
// export function onAuthStateChange(callback) {
//   return onAuthStateChanged(auth, callback);
// }

// /**
//  * Listen to realtime changes on user profile
//  */
// export function subscribeToUserProfile(userId, callback) {
//   if (!userId) return () => {};
//   const userDocRef = doc(db, 'users', userId);
//   return onSnapshot(
//     userDocRef,
//     (docSnap) => {
//       if (docSnap.exists()) {
//         callback(docSnap.data());
//       }
//     },
//     (err) => {
//       console.warn('Realtime profile sync note:', err);
//     }
//   );
// }

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOTugaWwGbcBOzViekI0NJaK5M9iCGt-g",
  authDomain: "nodal-dispatch-1xfhk.firebaseapp.com",
  projectId: "nodal-dispatch-1xfhk",
  storageBucket: "nodal-dispatch-1xfhk.firebasestorage.app",
  messagingSenderId: "631330670330",
  appId: "1:631330670330:web:7a4147cc4e5d038405ab43"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore (utilizing custom databaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Format Firebase Auth Error messages to be human-friendly
 */
export function getFriendlyAuthErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This scholar account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network request failed. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'This authentication method is currently not enabled.';
    default:
      return error.message || 'Authentication error occurred.';
  }
}

/**
 * Sign up a new user with Email and Password
 */
export async function registerWithEmail(email, password, fullName, university = 'Stanford University') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (fullName) {
    try {
      await updateProfile(user, { displayName: fullName });
    } catch (e) {
      console.warn('Update displayName warning:', e);
    }
  }

  const initialProfile = {
    userId: user.uid,
    fullName: fullName || 'Academic Scholar',
    email: user.email,
    university: university || 'Stanford University',
    academicLevel: 'PhD Candidate',
    title: 'Research Scholar',
    timeCredits: 20,
    skillsOffered: ['Applied Math', 'Python', 'LaTeX'],
    skillsToLearn: ['Machine Learning', 'Data Analysis'],
    bio: 'Doctoral researcher interested in peer skill exchange and collaborative research.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), initialProfile, { merge: true });
  } catch (err) {
    console.warn('Initial profile doc save note:', err);
  }

  return { user, profile: initialProfile };
}

/**
 * Sign in with Email and Password (with safe fallback handling for demo/UIU accounts)
 */
export async function loginWithEmail(email, password) {
  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const isDemoOrUiu =
      email.includes('uiu.ac.bd') ||
      email === 'unknown@bscse.uiu.ac.bd' ||
      email === 'scholar.alex@stanford.edu';

    // Only attempt auto-registration if the user explicitly doesn't exist
    if (err.code === 'auth/user-not-found' || isDemoOrUiu) {
      try {
        const uiuName = isDemoOrUiu ? 'Unknown (UIU Scholar)' : email.split('@')[0];
        const uiuUni = isDemoOrUiu ? 'United International University (UIU)' : 'Stanford University';
        return await registerWithEmail(email, password, uiuName, uiuUni);
      } catch (regErr) {
        // If registration fails because the user actually exists (wrong password case), rethrow original error
        throw err;
      }
    }
    throw err;
  }

  const user = userCredential.user;
  let profile = await getUserProfile(user.uid);

  if (!profile) {
    const isUiu = email.includes('uiu.ac.bd');
    profile = {
      userId: user.uid,
      fullName: user.displayName || (isUiu ? 'Unknown (UIU Scholar)' : user.email?.split('@')[0] || 'Scholar'),
      email: user.email,
      university: isUiu ? 'United International University (UIU)' : 'Stanford University',
      academicLevel: isUiu ? 'BSc in Computer Science & Engineering' : 'Graduate Scholar',
      title: 'Research Scholar',
      timeCredits: 20,
      skillsOffered: isUiu ? ['Algorithms', 'Data Structures', 'C++', 'Python'] : ['Applied Math', 'Python', 'LaTeX'],
      skillsToLearn: isUiu ? ['Machine Learning', 'Artificial Intelligence', 'Cloud Computing'] : ['Data Science', 'Machine Learning'],
      bio: isUiu ? 'Undergraduate researcher in Computer Science at United International University.' : 'Doctoral researcher in academic skill exchange.',
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Doc set warning:', e);
    }
  }
  return { user, profile };
}

/**
 * Sign in / Sign up with Google OAuth
 */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = {
      userId: user.uid,
      fullName: user.displayName || 'Google Scholar',
      email: user.email,
      university: 'Institutional Partner',
      academicLevel: 'Graduate Researcher',
      title: 'Visiting Scholar',
      timeCredits: 25,
      skillsOffered: ['Research Methods', 'Data Synthesis'],
      skillsToLearn: ['Statistical Modeling', 'Scientific Writing'],
      bio: 'Inter-university scholar collaborating through institutional authentication.',
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    } catch (e) {
      console.warn('Google profile creation note:', e);
    }
  }

  return { user, profile };
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetUserPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error('Error fetching user profile:', e);
  }
  return null;
}

/**
 * Save / update user profile in Firestore
 */
export async function saveUserProfile(userId, data) {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  const updatedData = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await setDoc(userDocRef, updatedData, { merge: true });
  return updatedData;
}

/**
 * Listen to realtime auth state changes
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Listen to realtime changes on user profile
 */
export function subscribeToUserProfile(userId, callback) {
  if (!userId) return () => {};
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    },
    (err) => {
      console.warn('Realtime profile sync note:', err);
    }
  );
}
