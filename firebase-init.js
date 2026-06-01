import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { firebaseConfig, HOUSEHOLD_ID } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.FB = {
  HID: HOUSEHOLD_ID,
  signIn: async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        signInWithRedirect(auth, provider);
      }
    }
  },
  signOut: () => signOut(auth),
  onAuth:  (cb) => onAuthStateChanged(auth, cb),
  setDoc:  (path, data) => setDoc(doc(db, ...path), data),
  getDoc:  (path) => getDoc(doc(db, ...path)),
  onSnap:  (path, cb, err) => onSnapshot(doc(db, ...path), cb, err),
};

document.dispatchEvent(new Event('firebase-ready'));
