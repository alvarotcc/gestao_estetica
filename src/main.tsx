import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './AuthContext.tsx';

// Importe todos os serviços do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Suas chaves de configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCG4I8q0d1iY0_UzYQJhRL8TMiBlALz9vc",
  authDomain: "kron-studio-car.firebaseapp.com",
  projectId: "kron-studio-car",
  storageBucket: "kron-studio-car.firebasestorage.app",
  messagingSenderId: "676445930978",
  appId: "1:676445930978:web:9542055f3c5e95c091a5bb",
  measurementId: "G-2C2KKBF24G"
};

// Inicialize a instância principal do Firebase
const app = initializeApp(firebaseConfig);

// Inicialize os serviços do Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Exporte a instância 'app' e os serviços que outros arquivos precisam
export { app, db, auth, analytics };

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);