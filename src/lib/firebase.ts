/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3jnqi7KOo5UGX_ZvayHAuCyuYq-uQAio",
  authDomain: "ultra-rarity-p8gvj.firebaseapp.com",
  projectId: "ultra-rarity-p8gvj",
  storageBucket: "ultra-rarity-p8gvj.firebasestorage.app",
  messagingSenderId: "856897537079",
  appId: "1:856897537079:web:641c9299f92ff47961ebb2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use the custom firestoreDatabaseId if provided, else use default
const db = getFirestore(app, "ai-studio-1f842e33-9275-43b0-bfe6-137cd1c8befc");

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, googleProvider };
