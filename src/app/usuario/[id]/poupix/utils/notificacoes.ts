"use client";

import { ConquistaCofrinho, Cofrinho } from "../types/types";

// Chaves para armazenar as notificações já mostradas no localStorage
const CONQUISTAS_MOSTRADAS_KEY = 'conquistas_mostradas';
const RECOMPENSAS_MOSTRADAS_KEY = 'recompensas_mostradas';
const SESSAO_ATUAL_KEY = 'poupix_sessao_atual';

/**
 * Verifica se uma conquista já foi mostrada ao usuário
 * @param conquista A conquista a ser verificada
 * @returns true se a conquista já foi mostrada, false caso contrário
 */
export const conquistaJaMostrada = (conquista: ConquistaCofrinho): boolean => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Obter as conquistas já mostradas do localStorage
    const conquistasMostradas = getConquistasMostradas();

    // Verificar se a conquista atual está na lista
    return conquistasMostradas.some(id => id === conquista.id);
  } catch (error) {
    console.error("Erro ao verificar conquista mostrada:", error);
    return false;
  }
};

/**
 * Marca uma conquista como já mostrada
 * @param conquista A conquista a ser marcada como mostrada
 */
export const marcarConquistaMostrada = (conquista: ConquistaCofrinho): void => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined' || !conquista.id) {
    return;
  }

  try {
    // Obter as conquistas já mostradas
    const conquistasMostradas = getConquistasMostradas();

    // Adicionar a conquista atual à lista se ainda não estiver
    if (!conquistasMostradas.includes(conquista.id)) {
      conquistasMostradas.push(conquista.id);

      // Salvar a lista atualizada no localStorage
      localStorage.setItem(CONQUISTAS_MOSTRADAS_KEY, JSON.stringify(conquistasMostradas));
    }
  } catch (error) {
    console.error("Erro ao marcar conquista como mostrada:", error);
  }
};

/**
 * Obtém a lista de IDs de conquistas já mostradas
 * @returns Array de IDs de conquistas já mostradas
 */
export const getConquistasMostradas = (): string[] => {
  try {
    const conquistasMostradas = localStorage.getItem(CONQUISTAS_MOSTRADAS_KEY);
    return conquistasMostradas ? JSON.parse(conquistasMostradas) : [];
  } catch (error) {
    console.error("Erro ao obter conquistas mostradas:", error);
    return [];
  }
};

/**
 * Gera uma chave única para uma recompensa de desafio
 * @param cofrinho O cofrinho com o desafio
 * @returns Uma string única para identificar a recompensa
 */
const gerarChaveRecompensa = (cofrinho: Cofrinho): string => {
  if (!cofrinho.id || !cofrinho.desafio) return '';

  // Usar o ID do cofrinho + dia atual do desafio como chave única
  return `${cofrinho.id}_${cofrinho.desafio.diaAtual}`;
};

/**
 * Verifica se uma recompensa de desafio já foi mostrada ao usuário
 * @param cofrinho O cofrinho com o desafio
 * @returns true se a recompensa já foi mostrada, false caso contrário
 */
export const recompensaJaMostrada = (cofrinho: Cofrinho): boolean => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined' || !cofrinho.id || !cofrinho.desafio) {
    return false;
  }

  try {
    // Obter as recompensas já mostradas do localStorage
    const recompensasMostradas = getRecompensasMostradas();

    // Gerar a chave única para esta recompensa
    const chaveRecompensa = gerarChaveRecompensa(cofrinho);

    // Verificar se a recompensa atual está na lista
    return recompensasMostradas.some(chave => chave === chaveRecompensa);
  } catch (error) {
    console.error("Erro ao verificar recompensa mostrada:", error);
    return false;
  }
};

/**
 * Marca uma recompensa de desafio como já mostrada
 * @param cofrinho O cofrinho com o desafio
 */
export const marcarRecompensaMostrada = (cofrinho: Cofrinho): void => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined' || !cofrinho.id || !cofrinho.desafio) {
    return;
  }

  try {
    // Obter as recompensas já mostradas
    const recompensasMostradas = getRecompensasMostradas();

    // Gerar a chave única para esta recompensa
    const chaveRecompensa = gerarChaveRecompensa(cofrinho);

    // Adicionar a recompensa atual à lista se ainda não estiver
    if (!recompensasMostradas.includes(chaveRecompensa)) {
      recompensasMostradas.push(chaveRecompensa);

      // Salvar a lista atualizada no localStorage
      localStorage.setItem(RECOMPENSAS_MOSTRADAS_KEY, JSON.stringify(recompensasMostradas));
    }
  } catch (error) {
    console.error("Erro ao marcar recompensa como mostrada:", error);
  }
};

/**
 * Obtém a lista de chaves de recompensas já mostradas
 * @returns Array de chaves de recompensas já mostradas
 */
export const getRecompensasMostradas = (): string[] => {
  try {
    const recompensasMostradas = localStorage.getItem(RECOMPENSAS_MOSTRADAS_KEY);
    return recompensasMostradas ? JSON.parse(recompensasMostradas) : [];
  } catch (error) {
    console.error("Erro ao obter recompensas mostradas:", error);
    return [];
  }
};

/**
 * Verifica se uma notificação específica já foi mostrada nesta sessão de navegação
 * @param id O ID da notificação (conquista ou recompensa)
 * @returns true se já mostramos esta notificação nesta sessão, false caso contrário
 */
export const verificarNotificacaoNaSessao = (id: string): boolean => {
  if (typeof window === 'undefined' || !id) {
    return false;
  }

  try {
    // Obter as notificações já mostradas nesta sessão
    const notificacoesSessao = window.sessionStorage.getItem(SESSAO_ATUAL_KEY);
    if (!notificacoesSessao) return false;

    // Converter para array e verificar se o ID está presente
    let notificacoes: string[] = [];
    try {
      const parsed = JSON.parse(notificacoesSessao);
      // Verificar se o resultado é realmente um array
      if (Array.isArray(parsed)) {
        notificacoes = parsed;
      } else {
        // Se não for um array, inicializar um novo array
        console.warn("Valor armazenado não é um array:", parsed);
        notificacoes = [];
      }
    } catch (parseError) {
      console.warn("Erro ao fazer parse do JSON:", parseError);
      notificacoes = [];
    }

    return notificacoes.includes(id);
  } catch (error) {
    console.error("Erro ao verificar notificação na sessão:", error);
    return false;
  }
};

/**
 * Marca uma notificação específica como mostrada nesta sessão de navegação
 * @param id O ID da notificação (conquista ou recompensa)
 */
export const marcarNotificacaoNaSessao = (id: string): void => {
  if (typeof window === 'undefined' || !id) {
    return;
  }

  try {
    // Obter as notificações já mostradas nesta sessão
    const notificacoesSessao = window.sessionStorage.getItem(SESSAO_ATUAL_KEY);

    // Inicializar o array de notificações
    let notificacoes: string[] = [];

    // Se já existir algo no sessionStorage, tentar fazer o parse
    if (notificacoesSessao) {
      try {
        const parsed = JSON.parse(notificacoesSessao);
        // Verificar se o resultado é realmente um array
        if (Array.isArray(parsed)) {
          notificacoes = parsed;
        } else {
          console.warn("Valor armazenado não é um array:", parsed);
        }
      } catch (parseError) {
        console.warn("Erro ao fazer parse do JSON:", parseError);
      }
    }

    // Adicionar o ID se ainda não estiver presente
    if (!notificacoes.includes(id)) {
      notificacoes.push(id);
      window.sessionStorage.setItem(SESSAO_ATUAL_KEY, JSON.stringify(notificacoes));
    }
  } catch (error) {
    console.error("Erro ao marcar notificação na sessão:", error);
  }
};
