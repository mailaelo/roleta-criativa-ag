import { initializeApp } from 'firebase/app';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy_api_key_for_dev',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy_auth_domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'roda-criativa',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy_storage',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'dummy_app_id'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Authentication Helpers
export async function sendLoginLink(email: string) {
  if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
    window.localStorage.setItem('mockUserEmail', email);
    window.location.reload();
    return;
  }
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

export async function finishLogin() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    if (email) {
      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        // Clear URL
        window.history.replaceState(null, '', window.location.pathname);
        return result.user;
      } catch (error) {
        console.error('Error signing in with email link', error);
        throw error;
      }
    }
  }
  return null;
}

export function observeAuth(callback: (user: any) => void) {
  const mockEmail = window.localStorage.getItem('mockUserEmail');
  if (mockEmail) {
    setTimeout(() => callback({ email: mockEmail }), 0);
  }
  return onAuthStateChanged(auth, (user) => {
    if (!mockEmail) {
      callback(user);
    }
  });
}

export function logout() {
  window.localStorage.removeItem('mockUserEmail');
  return signOut(auth);
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error with Google Sign-In', error);
    throw error;
  }
}

// Firestore Helpers
export async function saveAnalyticsDoc(payload: any) {
  if (payload.mode === 'Hobbie') {
    return { success: true, message: 'Hobbie mode, not saving to DB' };
  }

  if (payload.mode === 'Estudo' && !payload.userId) {
    throw new Error('userId is required for Estudo mode analytics');
  }

  const analyticsCollection = collection(db, 'user_data');
  const docRef = await addDoc(analyticsCollection, {
    timeSpentMs: payload.timeSpentMs || 0,
    moodCheckIn: payload.mood || 0,
    tags: payload.tags || [],
    goal: payload.goal || '',
    practiced: !!payload.practiced,
    mediaId: payload.mediaId || null,
    mediaName: payload.mediaName || null,
    userId: payload.userId || 'anonymous',
    mode: payload.mode || 'Estudo',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { success: true, id: docRef.id };
}

export async function getAnalyticsDocs(userId: string) {
  if (!userId) {
    throw new Error('userId is required to fetch analytics');
  }

  const analyticsCollection = collection(db, 'user_data');
  const q = query(analyticsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const analytics = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Map serverTimestamp/Timestamp to ISOString
      createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : new Date().toISOString()
    };
  });

  // Sort descending by createdAt in-memory
  analytics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { analytics };
}
