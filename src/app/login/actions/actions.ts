import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthErrorCodes
} from "firebase/auth";
import { auth, setAuthCookie, removeAuthCookie, getIdToken } from "../../../lib/auth";

// Criar novo usuário
export const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obter o token ID e definir o cookie
    const token = await getIdToken();
    if (token) {
      setAuthCookie(token);
    }
    
    return user;
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    
    // Tratamento de erros específicos
    if (error.code === 'auth/email-already-in-use') {
      
    } else if (error.code === 'auth/weak-password') {
     
    } else if (error.code === 'auth/invalid-email') {
    
    } else {
    
    }
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obter o token ID e definir o cookie
    const token = await getIdToken();
    if (token) {
      setAuthCookie(token);
    }
    
    return user;
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    
    // Tratamento de erros específicos
    if (error.code === 'auth/invalid-credential' || 
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password') {
    } else if (error.code === 'auth/user-disabled') {
      } else if (error.code === 'auth/too-many-requests') {
    } else {
      throw new Error("Erro ao fazer login. Tente novamente mais tarde.");
    }
  }
};

// Logout
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    // Remover o cookie de autenticação
    removeAuthCookie();
    
    // Redirecionar para a página de login (lado do cliente)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
  };
