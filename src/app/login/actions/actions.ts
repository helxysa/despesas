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
    console.log("Tentando criar usuário com email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuário criado com sucesso:", user.uid);
    
    // Obter o token ID e definir o cookie
    const token = await getIdToken();
    if (token) {
      setAuthCookie(token);
      console.log("Token definido com sucesso");
    }
    
    return user;
  } catch (error: any) {
    console.log("Erro detalhado ao criar usuário:", {
      code: error.code,
      message: error.message,
      fullError: error
    });
    return null;
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string) => {
  try {
    console.log("=== INÍCIO DO PROCESSO DE LOGIN ===");
    console.log("Tentando fazer login com email:", email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Credenciais recebidas:", userCredential);
    
    const user = userCredential.user;
    console.log("Dados do usuário:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      metadata: user.metadata
    });
    
    // Obter o token ID e definir o cookie
    const token = await user.getIdToken();
    console.log("Token obtido:", token ? "Sim" : "Não");
    
    if (token) {
      setAuthCookie(token);
      console.log("Cookie de autenticação definido");
    }
    
    console.log("=== FIM DO PROCESSO DE LOGIN ===");
    return user;
  } catch (error: any) {
    console.log("=== ERRO NO PROCESSO DE LOGIN ===");
    console.log("Código do erro:", error.code);
    console.log("Mensagem do erro:", error.message);
    console.log("Erro completo:", error);
    
    if (error.code === 'auth/invalid-credential' || 
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password') {
      return null;
    }
    return null;
  }
};

// Logout
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    removeAuthCookie();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};
