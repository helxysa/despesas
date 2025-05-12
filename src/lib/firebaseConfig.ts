// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9H3LdApLDU0MsL4IQ2yvJZK7scSri8AA",
  authDomain: "dividas-31b48.firebaseapp.com",
  projectId: "dividas-31b48",
  storageBucket: "dividas-31b48.firebasestorage.app",
  messagingSenderId: "405578134557",
  appId: "1:405578134557:web:12932ff0ede99a9540c2f4",
  measurementId: "G-32V3JNSLXK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Inicializar Analytics apenas no lado do cliente
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Importação dinâmica para evitar erro no servidor
    import('firebase/analytics').then(({ getAnalytics }) => {
      getAnalytics(app);
    });
  }
};