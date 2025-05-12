import { getAuth } from "firebase/auth";
import { app } from "./firebaseConfig";

// Inicializa o serviço de autenticação do Firebase
export const auth = getAuth(app);