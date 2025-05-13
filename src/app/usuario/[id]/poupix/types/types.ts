// Tipos para o sistema de cofrinhos virtuais (Poupix)

export interface Cofrinho {
  id?: string;
  userId: string;
  nome: string;
  meta: number;
  valorAtual: number;
  dataInicio: Date;
  dataEstimadaFim?: Date;
  categoria: CategoriaCofrinho;
  descricao?: string;
  icone?: string;
  cor?: string;
  progresso: number; // Porcentagem de progresso (0-100)
  desafio?: DesafioCofrinho | null;
  depositos: DepositoCofrinho[];
  conquistas: ConquistaCofrinho[];
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export enum CategoriaCofrinho {
  VIAGEM = "Viagem",
  COMPRA = "Compra",
  EMERGENCIA = "Fundo de Emergência",
  INVESTIMENTO = "Investimento",
  EDUCACAO = "Educação",
  DESAFIO = "Desafio de Economia",
  OUTRO = "Outro"
}

export interface DepositoCofrinho {
  id?: string;
  cofrinhoId: string;
  valor: number;
  data: Date;
  descricao?: string;
  origemReceita: boolean; // Se o valor foi retirado da receita mensal
  metodoDeposito: MetodoDeposito;
}

export enum MetodoDeposito {
  MANUAL = "Manual",
  PIX = "Pix",
  TRANSFERENCIA = "Transferência",
  ECONOMIA = "Economia de Gastos",
  DESAFIO = "Desafio"
}

export interface DesafioCofrinho {
  id?: string;
  cofrinhoId: string;
  tipo: TipoDesafio;
  valorInicial: number;
  valorIncremento?: number;
  duracaoDias: number;
  diaAtual: number;
  valorHoje: number;
  valorTotalEsperado: number;
  ativo: boolean;
  dataInicio: Date;
  dataFim?: Date;
}

export enum TipoDesafio {
  DIARIO_FIXO = "Valor Fixo Diário",
  SEMANAL_FIXO = "Valor Fixo Semanal",
  INCREMENTO_DIARIO = "Incremento Diário",
  MOEDAS = "Guardar Moedas"
}

export interface ConquistaCofrinho {
  id?: string;
  cofrinhoId: string;
  tipo: TipoConquista;
  descricao: string;
  data: Date;
  icone: string;
  desbloqueada: boolean;
}

export enum TipoConquista {
  DIAS_CONSECUTIVOS = "Dias Consecutivos",
  VALOR_ALCANCADO = "Valor Alcançado",
  META_PERCENTUAL = "Percentual da Meta",
  DESAFIO_COMPLETO = "Desafio Completo",
  PRIMEIRO_DEPOSITO = "Primeiro Depósito"
}

export interface NotificacaoEconomia {
  id?: string;
  userId: string;
  mensagem: string;
  valorSugerido: number;
  tipoEconomia: TipoEconomia;
  lida: boolean;
  aplicada: boolean;
  data: Date;
}

export enum TipoEconomia {
  DELIVERY = "Delivery",
  ASSINATURA = "Assinatura",
  COMPRA_IMPULSIVA = "Compra Impulsiva",
  LAZER = "Lazer",
  OUTRO = "Outro"
}