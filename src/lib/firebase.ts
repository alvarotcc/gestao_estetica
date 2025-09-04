// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Configurações do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCG4I8q0d1iY0_UzYQJhRL8TMiBlALz9vc",
  authDomain: "kron-studio-car.firebaseapp.com",
  projectId: "kron-studio-car",
  storageBucket: "kron-studio-car.firebasestorage.app",
  messagingSenderId: "676445930978",
  appId: "1:676445930978:web:9542055f3c5e95c091a5bb",
  measurementId: "G-2C2KKBF24G"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta os serviços que serão usados
export const db = getFirestore(app);
export const auth = getAuth(app);
