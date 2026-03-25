import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

import {
  ref as dbRef,
  get,
  set,
  update,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';

import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query as fsQuery,
  where,
} from 'firebase/firestore';

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { auth, db, firestore, storage } from './config';

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// ─── User Profile (Realtime Database → /users node) ───────────────────────────
// Mirrors Flutter: DatabaseReference dbref = FirebaseDatabase.instance.ref().child('users')

/**
 * Find the user's record in /users by their uid.
 * Returns { dbKey, data } or null.
 */
export async function getUserProfile(uid) {
  const usersRef = dbRef(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return null;

  let result = null;
  snapshot.forEach((child) => {
    if (child.val().uid === uid) {
      result = { dbKey: child.key, data: child.val() };
    }
  });
  return result;
}

/**
 * Create a new user profile in /users after registration.
 * Mirrors Flutter's dbref.push().set(user)
 */
export async function createUserProfile(uid, email, extraData = {}) {
  const usersRef = dbRef(db, 'users');
  const newUserRef = dbRef(db, `users/${Date.now()}_${uid.slice(0, 6)}`);
  await set(newUserRef, {
    uid,
    email,
    name:  '',
    bio:   '',
    phone: '',
    image: '',
    ...extraData,
  });
  return newUserRef.key;
}

/**
 * Update profile fields in /users/:dbKey
 * Mirrors Flutter's dbref.child(dbkey).update(updatedUser)
 */
export async function updateUserProfile(dbKey, updates) {
  const userRef = dbRef(db, `users/${dbKey}`);
  return update(userRef, updates);
}

// ─── Profile Photo (Firebase Storage) ─────────────────────────────────────────
// Mirrors Flutter: firebase_storage.FirebaseStorage.instance.ref().child('profile_pictures')

export async function uploadProfilePhoto(file, uid) {
  const timestamp  = Date.now();
  const photoRef   = storageRef(storage, `profile_pictures/profile_${timestamp}.jpg`);
  await uploadBytes(photoRef, file);
  return getDownloadURL(photoRef);
}

// ─── Wishlist (Firestore — collection named after uid) ────────────────────────
// Mirrors Flutter: FirebaseFirestore.instance.collection(user.uid)

/**
 * Add a car to the user's wishlist collection.
 * Stores the full car object — same structure as Flutter.
 */
export async function addToWishlist(uid, car) {
  const wishlistRef = collection(firestore, uid);
  console.log(wishlistRef);
  // Check if already in wishlist
  const q        = fsQuery(wishlistRef, where('name', '==', car.name));
  const existing = await getDocs(q);
  console.log(existing);
  if (!existing.empty) return { alreadyExists: true };

  // Mirror Flutter's carData structure exactly
  await addDoc(wishlistRef, {
    _id:    car._id,
    name:   car.name,
    brand:  car.brand,
    year:   car.year,
    price:  car.price,
    rating: car.rating,
    specificatios: {               // keep original Flutter typo for compatibility
      fuel:         car.specifications?.fuel         || '',
      engine:       car.specifications?.engine       || '',
      power:        car.specifications?.power        || '',
      drivetrain:   car.specifications?.drivetrain   || '',
      acceleration: car.specifications?.acceleration || '',
      seating:      car.specifications?.seating      || '',
    },
    Image: car.image || car.Image || '',
  });
  console.log("added in wishlist");
  return { alreadyExists: false };
}

/**
 * Get all cars in the user's wishlist collection.
 */
export async function getWishlist(uid) {
  const wishlistRef = collection(firestore, uid);
  const snapshot    = await getDocs(wishlistRef);
  return snapshot.docs.map((doc) => ({ firestoreId: doc.id, ...doc.data() }));
}

/**
 * Remove a car from the wishlist by its Firestore document ID.
 */
export async function removeFromWishlist(uid, firestoreId) {
  const { deleteDoc: del, doc } = await import('firebase/firestore');
  const { firestore: fs }       = await import('./config');
  return deleteDoc(doc(fs, uid, firestoreId));
}
