import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Firebase imports
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG4I8q0d1iY0_UzYQJhRL8TMiBlALz9vc",
  authDomain: "kron-studio-car.firebaseapp.com",
  projectId: "kron-studio-car",
  storageBucket: "kron-studio-car.firebasestorage.app",
  messagingSenderId: "676445930978",
  appId: "1:676445930978:web:9542055f3c5e95c091a5bb",
  measurementId: "G-2C2KKBF24G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
constanalytics = getAnalytics(app);
const db = getFirestore(app);

createRoot(document.getElementById("root")!).render(<App />);
