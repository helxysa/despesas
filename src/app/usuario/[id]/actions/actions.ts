import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    AuthErrorCodes
  } from "firebase/auth";
  import { auth } from "../../../../lib/auth";
  import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where,
    Timestamp,
    serverTimestamp
  } from "firebase/firestore";
  import { db } from "../../../../lib/firebaseConfig";
  import { Receita, DividaFixa, DespesaMensal, ParcelaMes } from "../types/types";

  
  // Funções para gerenciar receitas
  export const adicionarReceita = async (userId: string, salarioMensal: number) => {
    try {
      const receitaRef = await addDoc(collection(db, "receitas"), {
        userId,
        salarioMensal,
        dataRegistro: serverTimestamp()
      });
      
      return receitaRef.id;
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      throw new Error("Não foi possível adicionar a receita. Tente novamente.");
    }
  };
  
  export const atualizarReceita = async (receitaId: string, salarioMensal: number) => {
    try {
      const receitaRef = doc(db, "receitas", receitaId);
      await updateDoc(receitaRef, {
        salarioMensal,
        dataAtualizacao: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
      throw new Error("Não foi possível atualizar a receita. Tente novamente.");
    }
  };
  
  export const obterReceita = async (userId: string) => {
    try {
      const receitasRef = collection(db, "receitas");
      const q = query(receitasRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Retorna a receita mais recente
      let receita = null;
      let dataRecente = new Date(0);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dataRegistro = data.dataRegistro?.toDate() || new Date(0);
        
        if (dataRegistro > dataRecente) {
          dataRecente = dataRegistro;
          receita = {
            id: doc.id,
            ...data,
            dataRegistro
          };
        }
      });
      
      return receita;
    } catch (error) {
      console.error("Erro ao obter receita:", error);
      throw new Error("Não foi possível obter a receita. Tente novamente.");
    }
  };
  
  // Funções para gerenciar dívidas fixas
  export const adicionarDividaFixa = async (
    userId: string, 
    nome: string, 
    valorTotal: number, 
    numeroParcelas: number
  ) => {
    try {
      const valorParcela = valorTotal / numeroParcelas;
      const valorRestante = valorTotal;
      
      const dividaRef = await addDoc(collection(db, "dividasFixas"), {
        userId,
        nome,
        valorTotal,
        numeroParcelas,
        valorParcela,
        parcelasPagas: 0,
        valorRestante,
        dataRegistro: serverTimestamp()
      });
      
      // Criar as parcelas do mês para esta dívida
      const hoje = new Date();
      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(hoje);
        dataVencimento.setMonth(hoje.getMonth() + i - 1);
        
        await addDoc(collection(db, "parcelasMes"), {
          dividaId: dividaRef.id,
          userId,
          nome,
          valorParcela,
          numeroParcela: i,
          dataVencimento,
          paga: false,
          dataRegistro: serverTimestamp()
        });
      }
      
      return dividaRef.id;
    } catch (error) {
      console.error("Erro ao adicionar dívida fixa:", error);
      throw new Error("Não foi possível adicionar a dívida fixa. Tente novamente.");
    }
  };
  
  export const atualizarDividaFixa = async (
    dividaId: string, 
    nome: string, 
    valorTotal: number, 
    numeroParcelas: number, 
    parcelasPagas: number
  ) => {
    try {
      const valorParcela = valorTotal / numeroParcelas;
      const valorRestante = valorTotal - (valorParcela * parcelasPagas);
      
      const dividaRef = doc(db, "dividasFixas", dividaId);
      await updateDoc(dividaRef, {
        nome,
        valorTotal,
        numeroParcelas,
        valorParcela,
        parcelasPagas,
        valorRestante,
        dataAtualizacao: serverTimestamp()
      });
      
      // Atualizar as parcelas do mês para esta dívida
      const parcelasRef = collection(db, "parcelasMes");
      const q = query(parcelasRef, where("dividaId", "==", dividaId));
      const querySnapshot = await getDocs(q);
      
      // Excluir parcelas existentes
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Criar novas parcelas
      const hoje = new Date();
      for (let i = parcelasPagas + 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(hoje);
        dataVencimento.setMonth(hoje.getMonth() + i - parcelasPagas - 1);
        
        await addDoc(collection(db, "parcelasMes"), {
          dividaId,
          userId: (await getDoc(dividaRef)).data()?.userId,
          nome,
          valorParcela,
          numeroParcela: i,
          dataVencimento,
          paga: false,
          dataRegistro: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar dívida fixa:", error);
      throw new Error("Não foi possível atualizar a dívida fixa. Tente novamente.");
    }
  };
  
  export const obterDividasFixas = async (userId: string) => {
    try {
      const dividasRef = collection(db, "dividasFixas");
      const q = query(dividasRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const dividas: any[] = [];
      querySnapshot.forEach((doc) => {
        dividas.push({
          id: doc.id,
          ...doc.data(),
          dataRegistro: doc.data().dataRegistro?.toDate()
        });
      });
      
      return dividas;
    } catch (error) {
      console.error("Erro ao obter dívidas fixas:", error);
      throw new Error("Não foi possível obter as dívidas fixas. Tente novamente.");
    }
  };
  
  export const removerDividaFixa = async (dividaId: string) => {
    try {
      // Remover a dívida
      await deleteDoc(doc(db, "dividasFixas", dividaId));
      
      // Remover as parcelas associadas
      const parcelasRef = collection(db, "parcelasMes");
      const q = query(parcelasRef, where("dividaId", "==", dividaId));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error("Erro ao remover dívida fixa:", error);
      throw new Error("Não foi possível remover a dívida fixa. Tente novamente.");
    }
  };
  
  // Funções para gerenciar despesas mensais
  export const adicionarDespesaMensal = async (
    userId: string, 
    nome: string, 
    valor: number, 
    dataPrevistaPagamento?: Date
  ) => {
    try {
      const despesaRef = await addDoc(collection(db, "despesasMensais"), {
        userId,
        nome,
        valor,
        dataPrevistaPagamento: dataPrevistaPagamento ? Timestamp.fromDate(dataPrevistaPagamento) : null,
        dataRegistro: serverTimestamp()
      });
      
      return despesaRef.id;
    } catch (error) {
      console.error("Erro ao adicionar despesa mensal:", error);
      throw new Error("Não foi possível adicionar a despesa mensal. Tente novamente.");
    }
  };
  
  export const atualizarDespesaMensal = async (
    despesaId: string, 
    nome: string, 
    valor: number, 
    dataPrevistaPagamento?: Date
  ) => {
    try {
      const despesaRef = doc(db, "despesasMensais", despesaId);
      await updateDoc(despesaRef, {
        nome,
        valor,
        dataPrevistaPagamento: dataPrevistaPagamento ? Timestamp.fromDate(dataPrevistaPagamento) : null,
        dataAtualizacao: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar despesa mensal:", error);
      throw new Error("Não foi possível atualizar a despesa mensal. Tente novamente.");
    }
  };
  
  export const obterDespesasMensais = async (userId: string) => {
    try {
      const despesasRef = collection(db, "despesasMensais");
      const q = query(despesasRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const despesas: any[] = [];
      querySnapshot.forEach((doc) => {
        despesas.push({
          id: doc.id,
          ...doc.data(),
          dataPrevistaPagamento: doc.data().dataPrevistaPagamento?.toDate(),
          dataRegistro: doc.data().dataRegistro?.toDate()
        });
      });
      
      return despesas;
    } catch (error) {
      console.error("Erro ao obter despesas mensais:", error);
      throw new Error("Não foi possível obter as despesas mensais. Tente novamente.");
    }
  };
  
  export const removerDespesaMensal = async (despesaId: string) => {
    try {
      await deleteDoc(doc(db, "despesasMensais", despesaId));
      return true;
    } catch (error) {
      console.error("Erro ao remover despesa mensal:", error);
      throw new Error("Não foi possível remover a despesa mensal. Tente novamente.");
    }
  };
  
  // Funções para gerenciar parcelas do mês
  export const obterParcelasMes = async (userId: string, mes?: number, ano?: number) => {
    try {
      const hoje = new Date();
      const mesFiltro = mes !== undefined ? mes : hoje.getMonth();
      const anoFiltro = ano !== undefined ? ano : hoje.getFullYear();
      
      const parcelasRef = collection(db, "parcelasMes");
      const q = query(parcelasRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const parcelas: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dataVencimento = data.dataVencimento?.toDate();
        
        if (dataVencimento && 
            dataVencimento.getMonth() === mesFiltro && 
            dataVencimento.getFullYear() === anoFiltro) {
          parcelas.push({
            id: doc.id,
            ...data,
            dataVencimento,
            dataPagamento: data.dataPagamento?.toDate(),
            dataRegistro: data.dataRegistro?.toDate()
          });
        }
      });
      
      return parcelas;
    } catch (error) {
      console.error("Erro ao obter parcelas do mês:", error);
      throw new Error("Não foi possível obter as parcelas do mês. Tente novamente.");
    }
  };
  
  export const marcarParcelaPaga = async (parcelaId: string, paga: boolean) => {
    try {
      const parcelaRef = doc(db, "parcelasMes", parcelaId);
      await updateDoc(parcelaRef, {
        paga,
        dataPagamento: paga ? serverTimestamp() : null,
        dataAtualizacao: serverTimestamp()
      });
      
      // Se marcou como paga, atualizar a dívida fixa correspondente
      if (paga) {
        const parcelaDoc = await getDoc(parcelaRef);
        const parcelaData = parcelaDoc.data();
        
        if (parcelaData && parcelaData.dividaId) {
          const dividaRef = doc(db, "dividasFixas", parcelaData.dividaId);
          const dividaDoc = await getDoc(dividaRef);
          
          if (dividaDoc.exists()) {
            const dividaData = dividaDoc.data();
            const parcelasPagas = (dividaData.parcelasPagas || 0) + 1;
            const valorRestante = dividaData.valorTotal - (dividaData.valorParcela * parcelasPagas);
            
            await updateDoc(dividaRef, {
              parcelasPagas,
              valorRestante: valorRestante > 0 ? valorRestante : 0,
              dataAtualizacao: serverTimestamp()
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao marcar parcela como paga:", error);
      throw new Error("Não foi possível atualizar o status da parcela. Tente novamente.");
    }
  };
  
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
