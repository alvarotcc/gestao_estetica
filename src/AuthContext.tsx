import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
// Importe 'app' em vez de 'db' para inicializar o serviço de autenticação
import { app } from './main'; 

interface AuthContextType {
  currentUser: User | null;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app); // Corrigido: use 'app' em vez de 'db'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setUserId(user.uid);
      } else {
        await signInAnonymously(auth);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = { currentUser, userId, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};