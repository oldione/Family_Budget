import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { firebaseConfig, HOUSEHOLD_ID } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth).then(() => {
  window.FB = {
    HID: HOUSEHOLD_ID,
    setDoc: (path, data) => setDoc(doc(db, ...path), data),
    getDoc: (path) => getDoc(doc(db, ...path)),
    onSnap: (path, cb, err) => onSnapshot(doc(db, ...path), cb, err),
  };
  document.dispatchEvent(new Event('firebase-ready'));
}).catch(e => {
  console.warn('anon auth failed:', e.code);
  // Show visible error so the user knows sync is broken
  document.addEventListener('DOMContentLoaded', () => {}, {once:true});
  var msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#e05c5c;color:#fff;padding:12px 20px;border-radius:12px;font-family:Manrope,sans-serif;font-size:14px;z-index:9998';
  msg.textContent = 'Синхронизация отключена: ' + e.code + '. Включи Anonymous Auth в Firebase Console.';
  document.body.appendChild(msg);
});
