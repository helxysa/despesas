import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "./firebaseConfig";
import { cookies } from 'next/headers';

// Inicializa o serviço de autenticação do Firebase
export const auth = getAuth(app);

// Função para definir o cookie de autenticação (lado do cliente)
export const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `firebase-auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
};

// Função para remover o cookie de autenticação (lado do cliente)
export const removeAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'firebase-auth-token=; path=/; max-age=0; SameSite=Lax';
  }
};

// Função para obter o token ID do usuário atual
export const getIdToken = async (): Promise<string | null> => {
  const user = getAuth(app).currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
};
