import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCG4I8q0d1iY0_UzYQJhRL8TMiBlALz9vc",
  authDomain: "kron-studio-car.firebaseapp.com",
  projectId: "kron-studio-car",
  storageBucket: "kron-studio-car.firebasestorage.app",
  messagingSenderId: "676445930978",
  appId: "1:676445930978:web:9542055f3c5e95c091a5bb",
  measurementId: "G-2C2KKBF24G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser() {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@kronstudio.com",
      "admin123"
    );

    const user = userCredential.user;
    console.log("Usuário criado no Auth:", user.uid);

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      nome: "Administrador",
      email: "admin@kronstudio.com",
      role: "manager"
    });

    console.log("Usuário criado com sucesso!");
    console.log("Email: admin@kronstudio.com");
    console.log("Senha: admin123");
    console.log("Role: manager");

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  }
}

createTestUser();
