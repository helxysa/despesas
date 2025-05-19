'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, setAuthCookie, removeAuthCookie, getIdToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// Criar contexto de autenticação
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Hook para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Obter o token ID e definir o cookie
        const token = await getIdToken();
        if (token) {
          setAuthCookie(token);
        }
      } else {
        setUser(null);
        removeAuthCookie();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}