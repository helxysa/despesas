export interface Receita {
  id?: string;
  userId: string;
  salarioMensal: number;
  dataRegistro: Date;
}

export interface DividaFixa {
  id?: string;
  userId: string;
  nome: string;
  valorTotal: number;
  numeroParcelas: number;
  valorParcela: number;
  parcelasPagas: number;
  valorRestante: number;
  dataRegistro: Date;
}

export interface DespesaMensal {
  id?: string;
  userId: string;
  nome: string;
  valor: number;
  dataPrevistaPagamento?: Date;
  dataRegistro: Date;
}

export interface ParcelaMes {
  id?: string;
  dividaId: string;
  userId: string;
  nome: string;
  valorParcela: number;
  numeroParcela: number;
  dataVencimento: Date;
  paga: boolean;
  dataPagamento?: Date;
}
