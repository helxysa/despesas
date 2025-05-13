"use server";

import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { registrarGastoReceita } from "../../financeiro/actions/actions";
import {
  Cofrinho,
  DepositoCofrinho,
  DesafioCofrinho,
  ConquistaCofrinho,
  NotificacaoEconomia,
  CategoriaCofrinho,
  TipoDesafio,
  TipoConquista,
  MetodoDeposito,
} from "../types/types";

// Função para converter Timestamp do Firestore para Date
const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Função para converter um documento do Firestore para um objeto Cofrinho
const docToCofrinho = (doc: any): Cofrinho => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    nome: data.nome,
    meta: data.meta,
    valorAtual: data.valorAtual,
    dataInicio: timestampToDate(data.dataInicio),
    dataEstimadaFim: data.dataEstimadaFim ? timestampToDate(data.dataEstimadaFim) : undefined,
    categoria: data.categoria,
    descricao: data.descricao,
    icone: data.icone,
    cor: data.cor,
    progresso: data.progresso,
    desafio: data.desafio ? docToDesafio(data.desafio) : null,
    depositos: [],
    conquistas: [],
    dataCriacao: timestampToDate(data.dataCriacao),
    dataAtualizacao: timestampToDate(data.dataAtualizacao),
  };
};

// Função para converter um documento do Firestore para um objeto DesafioCofrinho
const docToDesafio = (data: any): DesafioCofrinho => {
  // Garantir que a propriedade ativo seja sempre um booleano
  const ativo = data.ativo === true;

  return {
    id: data.id,
    cofrinhoId: data.cofrinhoId,
    tipo: data.tipo,
    valorInicial: data.valorInicial,
    valorIncremento: data.valorIncremento,
    duracaoDias: data.duracaoDias,
    diaAtual: data.diaAtual,
    valorHoje: data.valorHoje,
    valorTotalEsperado: data.valorTotalEsperado,
    ativo: ativo,
    dataInicio: timestampToDate(data.dataInicio),
    dataFim: data.dataFim ? timestampToDate(data.dataFim) : undefined,
  };
};

// Função para converter um documento do Firestore para um objeto DepositoCofrinho
const docToDeposito = (doc: any): DepositoCofrinho => {
  const data = doc.data();
  return {
    id: doc.id,
    cofrinhoId: data.cofrinhoId,
    valor: data.valor,
    data: timestampToDate(data.data),
    descricao: data.descricao,
    origemReceita: data.origemReceita,
    metodoDeposito: data.metodoDeposito,
  };
};

// Função para converter um documento do Firestore para um objeto ConquistaCofrinho
const docToConquista = (doc: any): ConquistaCofrinho => {
  const data = doc.data();
  return {
    id: doc.id,
    cofrinhoId: data.cofrinhoId,
    tipo: data.tipo,
    descricao: data.descricao,
    data: timestampToDate(data.data),
    icone: data.icone,
    desbloqueada: data.desbloqueada,
  };
};

// Função para converter um documento do Firestore para um objeto NotificacaoEconomia
const docToNotificacao = (doc: any): NotificacaoEconomia => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    mensagem: data.mensagem,
    valorSugerido: data.valorSugerido,
    tipoEconomia: data.tipoEconomia,
    lida: data.lida,
    aplicada: data.aplicada,
    data: timestampToDate(data.data),
  };
};

// Obter todos os cofrinhos de um usuário
export const obterCofrinhos = async (userId: string): Promise<Cofrinho[]> => {
  try {
    const cofrinhoQuery = query(
      collection(db, "cofrinhos"),
      where("userId", "==", userId),
      orderBy("dataCriacao", "desc")
    );

    const cofrinhoSnapshot = await getDocs(cofrinhoQuery);
    const cofrinhos: Cofrinho[] = [];

    for (const cofrinhoDoc of cofrinhoSnapshot.docs) {
      const cofrinho = docToCofrinho(cofrinhoDoc);

      // Obter depósitos do cofrinho
      const depositosQuery = query(
        collection(db, "depositos"),
        where("cofrinhoId", "==", cofrinhoDoc.id),
        orderBy("data", "desc")
      );
      const depositosSnapshot = await getDocs(depositosQuery);
      cofrinho.depositos = depositosSnapshot.docs.map(docToDeposito);

      // Obter conquistas do cofrinho
      const conquistasQuery = query(
        collection(db, "conquistas"),
        where("cofrinhoId", "==", cofrinhoDoc.id),
        orderBy("data", "desc")
      );
      const conquistasSnapshot = await getDocs(conquistasQuery);
      cofrinho.conquistas = conquistasSnapshot.docs.map(docToConquista);

      cofrinhos.push(cofrinho);
    }

    return cofrinhos;
  } catch (error) {
    console.error("Erro ao obter cofrinhos:", error);
    throw error;
  }
};

// Obter um cofrinho específico
export const obterCofrinho = async (cofrinhoId: string): Promise<Cofrinho | null> => {
  try {
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      return null;
    }

    const cofrinho = docToCofrinho(cofrinhoDoc);

    // Obter depósitos do cofrinho
    const depositosQuery = query(
      collection(db, "depositos"),
      where("cofrinhoId", "==", cofrinhoId),
      orderBy("data", "desc")
    );
    const depositosSnapshot = await getDocs(depositosQuery);
    cofrinho.depositos = depositosSnapshot.docs.map(docToDeposito);

    // Obter conquistas do cofrinho
    const conquistasQuery = query(
      collection(db, "conquistas"),
      where("cofrinhoId", "==", cofrinhoId),
      orderBy("data", "desc")
    );
    const conquistasSnapshot = await getDocs(conquistasQuery);
    cofrinho.conquistas = conquistasSnapshot.docs.map(docToConquista);

    return cofrinho;
  } catch (error) {
    console.error("Erro ao obter cofrinho:", error);
    throw error;
  }
};

// Adicionar um novo cofrinho
export const adicionarCofrinho = async (
  userId: string,
  nome: string,
  meta: number,
  categoria: CategoriaCofrinho,
  descricao?: string,
  icone?: string,
  cor?: string,
  desafio?: {
    tipo: TipoDesafio;
    valorInicial: number;
    valorIncremento?: number;
    duracaoDias: number;
  }
): Promise<Cofrinho> => {
  try {
    const dataAtual = new Date();

    // Dados básicos do cofrinho
    const cofrinhoData = {
      userId,
      nome,
      meta,
      valorAtual: 0,
      dataInicio: dataAtual,
      categoria,
      descricao: descricao || "",
      icone: icone || "🐷", // Ícone padrão
      cor: cor || "#FF9500", // Cor padrão
      progresso: 0,
      dataCriacao: serverTimestamp(),
      dataAtualizacao: serverTimestamp(),
    };

    // Adicionar o cofrinho ao Firestore
    const cofrinhoRef = await addDoc(collection(db, "cofrinhos"), cofrinhoData);
    const cofrinhoId = cofrinhoRef.id;

    // Se tiver desafio, criar o desafio associado
    if (desafio) {
      const valorTotalEsperado = calcularValorTotalDesafio(
        desafio.tipo,
        desafio.valorInicial,
        desafio.valorIncremento,
        desafio.duracaoDias
      );

      const desafioData = {
        cofrinhoId,
        tipo: desafio.tipo,
        valorInicial: desafio.valorInicial,
        valorIncremento: desafio.valorIncremento || 0, // Garantir que valorIncremento nunca seja undefined
        duracaoDias: desafio.duracaoDias,
        diaAtual: 0,
        valorHoje: desafio.valorInicial,
        valorTotalEsperado,
        ativo: true,
        dataInicio: dataAtual,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp(),
      };

      await addDoc(collection(db, "desafios"), desafioData);

      // Garantir que a propriedade ativo seja um booleano
      const desafioParaSalvar = {
        ...desafioData,
        ativo: true
      };

      console.log("Salvando desafio no cofrinho:", desafioParaSalvar);

      // Atualizar o cofrinho com a referência ao desafio
      await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
        desafio: desafioParaSalvar,
      });
    }

    // Verificar se é o primeiro cofrinho do usuário
    const cofrinhoExistenteQuery = query(
      collection(db, "cofrinhos"),
      where("userId", "==", userId),
      limit(2) // Buscamos 2 para verificar se há mais de 1 (incluindo o que acabamos de criar)
    );

    const cofrinhoExistenteSnapshot = await getDocs(cofrinhoExistenteQuery);

    // Se houver apenas 1 cofrinho (o que acabamos de criar), então é o primeiro
    if (cofrinhoExistenteSnapshot.size <= 1) {
      // Criar a conquista de primeiro cofrinho
      const conquistaData = {
        cofrinhoId,
        tipo: TipoConquista.PRIMEIRO_DEPOSITO,
        descricao: "Você criou seu primeiro cofrinho!",
        data: dataAtual,
        icone: "🏆",
        desbloqueada: true,
        dataCriacao: serverTimestamp(),
      };

      await addDoc(collection(db, "conquistas"), conquistaData);
    }

    // Retornar o cofrinho criado
    return await obterCofrinho(cofrinhoId) as Cofrinho;
  } catch (error) {
    console.error("Erro ao adicionar cofrinho:", error);
    throw error;
  }
};

// Atualizar um cofrinho existente
export const atualizarCofrinho = async (
  cofrinhoId: string,
  nome: string,
  meta: number,
  categoria: CategoriaCofrinho,
  descricao?: string,
  icone?: string,
  cor?: string,
  desafio?: {
    tipo: TipoDesafio;
    valorInicial: number;
    valorIncremento?: number;
    duracaoDias: number;
  }
): Promise<Cofrinho> => {
  try {
    // Obter o cofrinho atual
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      throw new Error("Cofrinho não encontrado");
    }

    const cofrinhoData = cofrinhoDoc.data();
    const valorAtual = cofrinhoData.valorAtual || 0;
    const novoProgresso = meta > 0 ? (valorAtual / meta) * 100 : 0;

    // Dados atualizados do cofrinho
    const dadosAtualizados = {
      nome,
      meta,
      categoria,
      descricao: descricao || "",
      icone: icone || "🐷",
      cor: cor || "#FF9500",
      progresso: novoProgresso,
      dataAtualizacao: serverTimestamp(),
    };

    // Atualizar o cofrinho no Firestore
    await updateDoc(doc(db, "cofrinhos", cofrinhoId), dadosAtualizados);

    // Se tiver desafio e não existir um desafio atual, criar um novo
    if (desafio && !cofrinhoData.desafio) {
      const dataAtual = new Date();
      const valorTotalEsperado = calcularValorTotalDesafio(
        desafio.tipo,
        desafio.valorInicial,
        desafio.valorIncremento,
        desafio.duracaoDias
      );

      const desafioData = {
        cofrinhoId,
        tipo: desafio.tipo,
        valorInicial: desafio.valorInicial,
        valorIncremento: desafio.valorIncremento || 0,
        duracaoDias: desafio.duracaoDias,
        diaAtual: 0,
        valorHoje: desafio.valorInicial,
        valorTotalEsperado,
        ativo: true,
        dataInicio: dataAtual,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp(),
      };

      await addDoc(collection(db, "desafios"), desafioData);

      // Garantir que a propriedade ativo seja um booleano
      const desafioParaSalvar = {
        ...desafioData,
        ativo: true
      };

      console.log("Salvando desafio no cofrinho (atualização):", desafioParaSalvar);

      // Atualizar o cofrinho com a referência ao desafio
      await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
        desafio: desafioParaSalvar,
      });

      // Criar conquista de novo desafio
      const conquistaData = {
        cofrinhoId,
        tipo: TipoConquista.DESAFIO_COMPLETO, // Usando um tipo mais apropriado
        descricao: `Você iniciou um desafio ${desafio.tipo}!`,
        data: new Date(),
        icone: "🏆",
        desbloqueada: true,
        dataCriacao: serverTimestamp(),
      };

      await addDoc(collection(db, "conquistas"), conquistaData);
    }

    // Retornar o cofrinho atualizado
    return await obterCofrinho(cofrinhoId) as Cofrinho;
  } catch (error) {
    console.error("Erro ao atualizar cofrinho:", error);
    throw error;
  }
};

// Função auxiliar para calcular o valor total esperado de um desafio
const calcularValorTotalDesafio = (
  tipo: TipoDesafio,
  valorInicial: number,
  valorIncremento?: number,
  duracaoDias?: number
): number => {
  // Garantir que os valores nunca sejam undefined
  const dias = duracaoDias || 30;
  const incremento = valorIncremento || 0;

  switch (tipo) {
    case TipoDesafio.DIARIO_FIXO:
      return valorInicial * dias;
    case TipoDesafio.SEMANAL_FIXO:
      // Para desafio semanal, calculamos o número de semanas
      const semanas = Math.ceil(dias / 7);
      return valorInicial * semanas;
    case TipoDesafio.INCREMENTO_DIARIO:
      return dias * valorInicial + (dias * (dias - 1) / 2) * incremento;
    default:
      return valorInicial * dias;
  }
};

// Adicionar um depósito a um cofrinho
export const adicionarDeposito = async (
  cofrinhoId: string,
  valor: number,
  origemReceita: boolean,
  metodoDeposito: MetodoDeposito,
  descricao?: string
): Promise<DepositoCofrinho | null> => {
  try {
    const dataAtual = new Date();

    // Obter o cofrinho atual
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      throw new Error("Cofrinho não encontrado");
    }

    const cofrinhoData = cofrinhoDoc.data();
    const valorAtual = cofrinhoData.valorAtual || 0;
    const meta = cofrinhoData.meta || 0;
    const progressoAtual = meta > 0 ? (valorAtual / meta) * 100 : 0;

    // Verificar se o cofrinho já atingiu a meta (exceto para depósitos de desafios)
    if (progressoAtual >= 100 && metodoDeposito !== MetodoDeposito.DESAFIO) {
      console.log("Cofrinho já atingiu 100% da meta. Não é possível adicionar mais depósitos.");
      return null; // Retornar null em vez de lançar um erro
    }

    const novoValor = valorAtual + valor;
    const novoProgresso = meta > 0 ? (novoValor / meta) * 100 : 0;

    // Dados do depósito
    const depositoData = {
      cofrinhoId,
      valor,
      data: dataAtual,
      descricao: descricao || "Depósito manual",
      origemReceita,
      metodoDeposito,
      dataCriacao: serverTimestamp(),
    };

    // Adicionar o depósito ao Firestore
    const depositoRef = await addDoc(collection(db, "depositos"), depositoData);

    // Atualizar o valor atual e o progresso do cofrinho
    await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
      valorAtual: novoValor,
      progresso: novoProgresso,
      dataAtualizacao: serverTimestamp(),
    });

    // Se o depósito for da receita mensal, registrar como gasto no módulo financeiro
    if (origemReceita) {
      const userId = cofrinhoData.userId;
      const nomeCofrinho = cofrinhoData.nome;
      await registrarGastoReceita(
        userId,
        valor,
        nomeCofrinho || "Cofrinho"
      );
    }

    // Verificar se atingiu alguma conquista
    await verificarConquistas(cofrinhoId, novoValor, novoProgresso);

    // Retornar o depósito criado
    const depositoDoc = await getDoc(depositoRef);
    return docToDeposito(depositoDoc);
  } catch (error) {
    console.error("Erro ao adicionar depósito:", error);
    throw error;
  }
};

// Verificar e adicionar conquistas com base no progresso
const verificarConquistas = async (
  cofrinhoId: string,
  valorAtual: number,
  progresso: number
): Promise<void> => {
  try {
    // Verificar conquistas de valor alcançado
    const valoresConquista = [100, 500, 1000, 5000, 10000];
    for (const valor of valoresConquista) {
      if (valorAtual >= valor) {
        // Verificar se a conquista já existe
        const conquistaQuery = query(
          collection(db, "conquistas"),
          where("cofrinhoId", "==", cofrinhoId),
          where("tipo", "==", TipoConquista.VALOR_ALCANCADO),
          where("descricao", "==", `Você alcançou R$ ${valor.toFixed(2)}!`)
        );

        const conquistaSnapshot = await getDocs(conquistaQuery);

        if (conquistaSnapshot.empty) {
          // Criar nova conquista
          const conquistaData = {
            cofrinhoId,
            tipo: TipoConquista.VALOR_ALCANCADO,
            descricao: `Você alcançou R$ ${valor.toFixed(2)}!`,
            data: new Date(),
            icone: "💰",
            desbloqueada: true,
            dataCriacao: serverTimestamp(),
          };

          await addDoc(collection(db, "conquistas"), conquistaData);
        }
      }
    }

    // Verificar conquistas de percentual da meta
    const percentuaisConquista = [25, 50, 75, 100];
    for (const percentual of percentuaisConquista) {
      if (progresso >= percentual) {
        // Verificar se a conquista já existe
        const conquistaQuery = query(
          collection(db, "conquistas"),
          where("cofrinhoId", "==", cofrinhoId),
          where("tipo", "==", TipoConquista.META_PERCENTUAL),
          where("descricao", "==", `Você atingiu ${percentual}% da sua meta!`)
        );

        const conquistaSnapshot = await getDocs(conquistaQuery);

        if (conquistaSnapshot.empty) {
          // Criar nova conquista
          const conquistaData = {
            cofrinhoId,
            tipo: TipoConquista.META_PERCENTUAL,
            descricao: `Você atingiu ${percentual}% da sua meta!`,
            data: new Date(),
            icone: percentual === 100 ? "🎉" : "🎯",
            desbloqueada: true,
            dataCriacao: serverTimestamp(),
          };

          await addDoc(collection(db, "conquistas"), conquistaData);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao verificar conquistas:", error);
  }
};

// Obter notificações de economia para um usuário
export const obterNotificacoes = async (userId: string): Promise<NotificacaoEconomia[]> => {
  try {
    const notificacoesQuery = query(
      collection(db, "notificacoes"),
      where("userId", "==", userId),
      where("lida", "==", false),
      orderBy("data", "desc")
    );

    const notificacoesSnapshot = await getDocs(notificacoesQuery);
    return notificacoesSnapshot.docs.map(docToNotificacao);
  } catch (error) {
    console.error("Erro ao obter notificações:", error);
    throw error;
  }
};

// Marcar uma notificação como lida
export const marcarNotificacaoComoLida = async (notificacaoId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "notificacoes", notificacaoId), {
      lida: true,
      dataAtualizacao: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw error;
  }
};

// Aplicar uma sugestão de economia
export const aplicarSugestaoEconomia = async (
  notificacaoId: string,
  cofrinhoId: string
): Promise<boolean> => {
  try {
    // Obter a notificação
    const notificacaoDoc = await getDoc(doc(db, "notificacoes", notificacaoId));

    if (!notificacaoDoc.exists()) {
      throw new Error("Notificação não encontrada");
    }

    const notificacaoData = notificacaoDoc.data();

    // Adicionar o depósito ao cofrinho
    const resultado = await adicionarDeposito(
      cofrinhoId,
      notificacaoData.valorSugerido,
      false,
      MetodoDeposito.ECONOMIA,
      `Economia de ${notificacaoData.tipoEconomia}`
    );

    // Se o resultado for null, significa que o cofrinho já atingiu 100% da meta
    if (resultado === null) {
      console.log("Não foi possível aplicar a sugestão: cofrinho já atingiu 100% da meta");
      return false;
    }

    // Marcar a notificação como aplicada
    await updateDoc(doc(db, "notificacoes", notificacaoId), {
      aplicada: true,
      lida: true,
      dataAtualizacao: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Erro ao aplicar sugestão de economia:", error);
    throw error;
  }
};

// Apagar um cofrinho
export const apagarCofrinho = async (cofrinhoId: string): Promise<void> => {
  try {
    // Verificar se o cofrinho existe
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      throw new Error("Cofrinho não encontrado");
    }

    // Obter todos os depósitos relacionados ao cofrinho
    const depositosQuery = query(
      collection(db, "depositos"),
      where("cofrinhoId", "==", cofrinhoId)
    );
    const depositosSnapshot = await getDocs(depositosQuery);

    // Excluir todos os depósitos
    const depositosPromises = depositosSnapshot.docs.map(depositoDoc =>
      deleteDoc(doc(db, "depositos", depositoDoc.id))
    );
    await Promise.all(depositosPromises);

    // Obter todas as conquistas relacionadas ao cofrinho
    const conquistasQuery = query(
      collection(db, "conquistas"),
      where("cofrinhoId", "==", cofrinhoId)
    );
    const conquistasSnapshot = await getDocs(conquistasQuery);

    // Excluir todas as conquistas
    const conquistasPromises = conquistasSnapshot.docs.map(conquistaDoc =>
      deleteDoc(doc(db, "conquistas", conquistaDoc.id))
    );
    await Promise.all(conquistasPromises);

    // Obter o desafio relacionado ao cofrinho (se existir)
    const desafiosQuery = query(
      collection(db, "desafios"),
      where("cofrinhoId", "==", cofrinhoId)
    );
    const desafiosSnapshot = await getDocs(desafiosQuery);

    // Excluir o desafio
    const desafiosPromises = desafiosSnapshot.docs.map(desafioDoc =>
      deleteDoc(doc(db, "desafios", desafioDoc.id))
    );
    await Promise.all(desafiosPromises);

    // Finalmente, excluir o cofrinho
    await deleteDoc(doc(db, "cofrinhos", cofrinhoId));

  } catch (error) {
    console.error("Erro ao apagar cofrinho:", error);
    throw error;
  }
};

// Marcar um desafio como cumprido para o dia atual
export const cumprirDesafioDoDia = async (cofrinhoId: string): Promise<void> => {
  try {
    // Verificar se o cofrinho existe
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      throw new Error("Cofrinho não encontrado");
    }

    const cofrinhoData = cofrinhoDoc.data();

    // Verificar se o cofrinho tem um desafio ativo
    if (!cofrinhoData.desafio || !cofrinhoData.desafio.ativo) {
      throw new Error("Este cofrinho não possui um desafio ativo");
    }

    const desafio = cofrinhoData.desafio;

    // Verificar se o desafio já atingiu o número máximo de dias
    if (desafio.diaAtual >= desafio.duracaoDias) {
      throw new Error("Este desafio já atingiu o número máximo de dias");
    }

    // Calcular o novo dia atual e o valor para hoje
    let novoDiaAtual = desafio.diaAtual;
    let novoValorHoje = 0; // Inicializar com zero e definir o valor correto abaixo

    // Atualizar o valor de hoje com base no tipo de desafio
    switch (desafio.tipo) {
      case TipoDesafio.DIARIO_FIXO:
        // Para desafio diário fixo, incrementamos 1 dia e o valor é sempre o valor inicial configurado
        novoDiaAtual += 1;
        novoValorHoje = desafio.valorInicial;
        console.log(`Desafio diário fixo: valor hoje = ${novoValorHoje}, valor inicial = ${desafio.valorInicial}, dia atual = ${novoDiaAtual}`);
        break;
      case TipoDesafio.SEMANAL_FIXO:
        // Para desafio semanal, incrementamos 7 dias (uma semana completa)
        novoDiaAtual += 7;

        // Calcular a semana atual
        const semanaAtual = Math.ceil(novoDiaAtual / 7);

        // Para desafio semanal, o valor é sempre o valor inicial
        novoValorHoje = desafio.valorInicial;

        console.log(`Desafio semanal: Incrementando para semana ${semanaAtual}, valor = ${novoValorHoje}, dia atual = ${novoDiaAtual}`);
        break;
      case TipoDesafio.INCREMENTO_DIARIO:
        // Para desafio com incremento, incrementamos 1 dia
        novoDiaAtual += 1;

        // O valor é o inicial mais o incremento multiplicado pelo dia atual - 1
        const incremento = desafio.valorIncremento || 0;
        novoValorHoje = desafio.valorInicial + (novoDiaAtual - 1) * incremento;

        console.log(`Desafio incremento diário: valor hoje = ${novoValorHoje}, valor inicial = ${desafio.valorInicial}, incremento = ${incremento}, dia atual = ${novoDiaAtual}`);
        break;
      default:
        novoValorHoje = desafio.valorInicial;
    }

    // Obter o desafio relacionado ao cofrinho no Firestore
    const desafiosQuery = query(
      collection(db, "desafios"),
      where("cofrinhoId", "==", cofrinhoId)
    );
    const desafiosSnapshot = await getDocs(desafiosQuery);

    if (!desafiosSnapshot.empty) {
      // Atualizar o desafio com o novo dia atual e valor
      const desafioDoc = desafiosSnapshot.docs[0];
      const desafioAtual = desafioDoc.data();

      console.log("Desafio antes da atualização:", {
        id: desafioDoc.id,
        tipo: desafioAtual.tipo,
        valorInicial: desafioAtual.valorInicial,
        valorIncremento: desafioAtual.valorIncremento,
        diaAtual: desafioAtual.diaAtual,
        valorHoje: desafioAtual.valorHoje
      });

      console.log("Atualizando para:", {
        diaAtual: novoDiaAtual,
        valorHoje: novoValorHoje
      });

      await updateDoc(doc(db, "desafios", desafioDoc.id), {
        diaAtual: novoDiaAtual,
        valorHoje: novoValorHoje,
        dataAtualizacao: serverTimestamp(),
      });

      // Verificar se o desafio foi concluído
      if (novoDiaAtual >= desafio.duracaoDias) {
        await updateDoc(doc(db, "desafios", desafioDoc.id), {
          ativo: false,
          dataFim: new Date(),
        });

        // Adicionar uma conquista de desafio completo
        const conquistaData = {
          cofrinhoId,
          tipo: TipoConquista.DESAFIO_COMPLETO,
          descricao: `Você completou o desafio ${desafio.tipo}!`,
          data: new Date(),
          icone: "🏆",
          desbloqueada: true,
          dataCriacao: serverTimestamp(),
        };

        await addDoc(collection(db, "conquistas"), conquistaData);
      }
    }

    // Atualizar o desafio no cofrinho
    const desafioAtualizado = {
      ...desafio,
      diaAtual: novoDiaAtual,
      valorHoje: novoValorHoje,
      ativo: novoDiaAtual < desafio.duracaoDias
    };

    console.log("Desafio atualizado para o cofrinho:", {
      ...desafioAtualizado,
      valorInicial: desafioAtualizado.valorInicial,
      tipo: desafioAtualizado.tipo
    });

    // Se o desafio foi concluído, remover do cofrinho
    if (novoDiaAtual >= desafio.duracaoDias) {
      console.log("Desafio concluído, removendo do cofrinho");
      await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
        desafio: null,
        dataAtualizacao: serverTimestamp(),
      });
    } else {
      // Caso contrário, atualizar o desafio no cofrinho
      console.log("Atualizando desafio no cofrinho");
      await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
        desafio: desafioAtualizado,
        dataAtualizacao: serverTimestamp(),
      });
    }

    // Adicionar um depósito correspondente ao valor do desafio
    if (novoValorHoje > 0) {
      // Mensagem de depósito diferente para cada tipo de desafio
      let mensagemDeposito = "";

      if (desafio.tipo === TipoDesafio.SEMANAL_FIXO) {
        const semanaAtual = Math.ceil(novoDiaAtual / 7);
        mensagemDeposito = `Depósito do desafio - Semana ${semanaAtual}`;
        console.log(`Adicionando depósito de R$ ${novoValorHoje} para o desafio semanal - Semana ${semanaAtual}`);
      } else {
        mensagemDeposito = `Depósito do desafio - Dia ${novoDiaAtual}`;
        console.log(`Adicionando depósito de R$ ${novoValorHoje} para o desafio - Dia ${novoDiaAtual}`);
      }

      const resultado = await adicionarDeposito(
        cofrinhoId,
        novoValorHoje,
        false, // Não é da receita mensal
        MetodoDeposito.DESAFIO,
        mensagemDeposito
      );

      // Se o resultado for null, significa que o cofrinho já atingiu 100% da meta
      // Mas isso não deveria acontecer para depósitos de desafio, pois eles são permitidos mesmo com 100%
      if (resultado === null) {
        console.log("Aviso: Não foi possível adicionar o depósito do desafio.");
      }
    }

  } catch (error) {
    console.error("Erro ao cumprir desafio do dia:", error);
    throw error;
  }
};

// Finalizar um desafio
export const finalizarDesafio = async (cofrinhoId: string): Promise<void> => {
  try {
    // Verificar se o cofrinho existe
    const cofrinhoDoc = await getDoc(doc(db, "cofrinhos", cofrinhoId));

    if (!cofrinhoDoc.exists()) {
      throw new Error("Cofrinho não encontrado");
    }

    const cofrinhoData = cofrinhoDoc.data();

    // Verificar se o cofrinho tem um desafio
    if (!cofrinhoData.desafio) {
      throw new Error("Este cofrinho não possui um desafio");
    }

    // Se o desafio já estiver inativo, não precisamos fazer nada
    if (cofrinhoData.desafio && !cofrinhoData.desafio.ativo) {
      // Remover o desafio do cofrinho completamente
      await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
        desafio: null,
        dataAtualizacao: serverTimestamp(),
      });
      return;
    }

    // Obter o desafio relacionado ao cofrinho
    const desafiosQuery = query(
      collection(db, "desafios"),
      where("cofrinhoId", "==", cofrinhoId)
    );
    const desafiosSnapshot = await getDocs(desafiosQuery);

    if (!desafiosSnapshot.empty) {
      // Atualizar o desafio para inativo e definir a data de fim
      const desafioDoc = desafiosSnapshot.docs[0];
      await updateDoc(doc(db, "desafios", desafioDoc.id), {
        ativo: false,
        dataFim: new Date(),
        dataAtualizacao: serverTimestamp(),
      });
    }

    // Remover o desafio do cofrinho completamente
    await updateDoc(doc(db, "cofrinhos", cofrinhoId), {
      desafio: null,
      dataAtualizacao: serverTimestamp(),
    });

    // Adicionar uma conquista de desafio completo
    const conquistaData = {
      cofrinhoId,
      tipo: TipoConquista.DESAFIO_COMPLETO,
      descricao: `Você completou o desafio ${cofrinhoData.desafio.tipo}!`,
      data: new Date(),
      icone: "🏆",
      desbloqueada: true,
      dataCriacao: serverTimestamp(),
    };

    await addDoc(collection(db, "conquistas"), conquistaData);

  } catch (error) {
    console.error("Erro ao finalizar desafio:", error);
    throw error;
  }
};