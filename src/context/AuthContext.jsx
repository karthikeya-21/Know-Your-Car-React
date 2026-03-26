import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  createUserProfile,
  getWishlist,
} from '../firebase/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [profile,  setProfile]  = useState(null);  // { dbKey, data }
  const [wishlist, setWishlist] = useState(null);  // null = not loaded yet
  const [loading,  setLoading]  = useState(true);

  // Ref to prevent double-fetching in StrictMode
  const fetchedRef = useRef(false);

  // Fetch profile + wishlist once when user is known
  const loadUserData = async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      const [prof, wish] = await Promise.all([
        getUserProfile(firebaseUser.uid),
        getWishlist(firebaseUser.uid),
      ]);
      setProfile(prof);
      setWishlist(wish);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Only fetch from DB if not already cached
        if (!fetchedRef.current) {
          fetchedRef.current = true;
          await loadUserData(firebaseUser);
        }
      } else {
        setUser(null);
        setProfile(null);
        setWishlist(null);
        fetchedRef.current = false;
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const cred = await loginUser(email, password);
    setUser(cred.user);
    fetchedRef.current = true;
    await loadUserData(cred.user);
    return cred.user;
  };

  const register = async (email, password) => {
    const cred  = await registerUser(email, password);
    const dbKey = await createUserProfile(cred.user.uid, email);
    const prof  = { dbKey, data: { uid: cred.user.uid, email, name: '', bio: '', phone: '', image: '' } };
    setUser(cred.user);
    setProfile(prof);
    setWishlist([]);
    fetchedRef.current = true;
    return cred.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    setWishlist(null);
    fetchedRef.current = false;
  };

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, data: { ...prev?.data, ...updates } }));
  };

  // Add to local wishlist cache without refetching
  const addToWishlistCache = (car) => {
    setWishlist((prev) => (prev ? [...prev, car] : [car]));
  };

  // Remove from local wishlist cache without refetching
  const removeFromWishlistCache = (firestoreId) => {
    setWishlist((prev) => prev ? prev.filter((c) => c.firestoreId !== firestoreId) : []);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, wishlist, loading,
      login, register, logout,
      updateProfile, addToWishlistCache, removeFromWishlistCache,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
