import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  createUserProfile,
} from '../firebase/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);  // Firebase Auth user
  const [profile, setProfile] = useState(null);  // Realtime DB profile { dbKey, data }
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state — fires on login, logout, and page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch profile from Realtime Database
        try {
          const prof = await getUserProfile(firebaseUser.uid);
          setProfile(prof);
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const cred = await loginUser(email, password);
    const prof = await getUserProfile(cred.user.uid);
    setProfile(prof);
    return cred.user;
  };

  const register = async (email, password) => {
    const cred  = await registerUser(email, password);
    // Create profile in Realtime Database — mirrors Flutter's registration flow
    const dbKey = await createUserProfile(cred.user.uid, email);
    setProfile({ dbKey, data: { uid: cred.user.uid, email, name: '', bio: '', phone: '', image: '' } });
    return cred.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = (updates) => {
    setProfile((prev) => ({
      ...prev,
      data: { ...prev?.data, ...updates },
    }));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
