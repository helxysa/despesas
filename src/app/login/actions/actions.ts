import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthErrorCodes
} from "firebase/auth";
import { auth } from "../../../lib/auth";

// Criar novo usuário
export const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    
    // Tratamento de erros específicos
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Este email já está sendo usado por outra conta.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("O formato do email é inválido.");
    } else {
      throw new Error("Erro ao criar conta. Tente novamente mais tarde.");
    }
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    
    // Tratamento de erros específicos
    if (error.code === 'auth/invalid-credential' || 
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password') {
      throw new Error("Email ou senha incorretos. Verifique suas credenciais.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("Esta conta foi desativada.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Muitas tentativas de login. Tente novamente mais tarde.");
    } else {
      throw new Error("Erro ao fazer login. Tente novamente mais tarde.");
    }
  }
};

// Logout
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
  };
