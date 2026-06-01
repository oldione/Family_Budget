import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { firebaseConfig, HOUSEHOLD_ID } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Ждём обработки редиректа ДО инициализации приложения — иначе iOS пропускает результат
getRedirectResult(auth).catch(() => {}).finally(() => {
  window.FB = {
    HID: HOUSEHOLD_ID,
    signIn:  () => signInWithRedirect(auth, provider),
    signOut: () => signOut(auth),
    onAuth:  (cb) => onAuthStateChanged(auth, cb),
    setDoc:  (path, data) => setDoc(doc(db, ...path), data),
    getDoc:  (path) => getDoc(doc(db, ...path)),
    onSnap:  (path, cb, err) => onSnapshot(doc(db, ...path), cb, err),
  };

  document.dispatchEvent(new Event('firebase-ready'));
});
