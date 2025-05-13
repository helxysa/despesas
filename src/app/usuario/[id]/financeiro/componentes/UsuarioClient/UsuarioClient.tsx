"use client";

import { useEffect, useState } from 'react';
import {
  obterReceita,
  obterDividasFixas,
  obterDespesasMensais,
  obterParcelasMes
} from '../../actions/actions';
import { Receita, DividaFixa, DespesaMensal, ParcelaMes } from '../../types/types';

// Componentes
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { FinancialSummaryCards } from '../FinancialSummaryCards/FinancialSummaryCards';
import { BudgetProgressCard } from '../BudgetProgressCard/BudgetProgressCard';
import { FinancialTabs } from '../FinancialTabs/FinancialTabs';

interface UsuarioClientProps {
  id: string;
}

export function UsuarioClient({ id }: UsuarioClientProps) {
  const [receita, setReceita] = useState<Receita | null>(null);
  const [dividasFixas, setDividasFixas] = useState<DividaFixa[]>([]);
  const [despesasMensais, setDespesasMensais] = useState<DespesaMensal[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Salvar o ID no localStorage quando o componente montar
    localStorage.setItem('usuarioId', id);
    console.log('ID do usuário salvo no localStorage:', id);

    // Carregar dados financeiros
    carregarDados();
  }, [id]);

  // Função para carregar dados financeiros
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [receitaData, dividasData, despesasData, parcelasData] = await Promise.all([
        obterReceita(id),
        obterDividasFixas(id),
        obterDespesasMensais(id),
        obterParcelasMes(id)
      ]);

      setReceita(receitaData);
      setDividasFixas(dividasData);
      setDespesasMensais(despesasData);
      setParcelas(parcelasData);

      // Verificar se é um novo usuário (sem receita cadastrada)
      setIsNewUser(!receitaData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a receita
  const handleReceitaUpdate = (receitaAtualizada: Receita) => {
    setReceita(receitaAtualizada);
    setIsNewUser(false);
  };

  // Função para atualizar as dívidas fixas
  const handleDividasUpdate = (dividasAtualizadas: DividaFixa[]) => {
    setDividasFixas(dividasAtualizadas);
    // Recarregar parcelas do mês também, já que novas parcelas foram criadas
    carregarDados();
  };

  // Função para atualizar as despesas mensais
  const handleDespesasUpdate = (despesasAtualizadas: DespesaMensal[]) => {
    setDespesasMensais(despesasAtualizadas);
  };

  // Calcular totais financeiros
  const totalDespesas = despesasMensais.reduce((total, despesa) => total + despesa.valor, 0);
  const totalDividas = dividasFixas.reduce((total, divida) => total + divida.valorParcela, 0);
  const totalGastos = totalDespesas + totalDividas;
  const saldoDisponivel = receita?.salarioMensal ? receita.salarioMensal - totalGastos : 0;
  const percentualGasto = receita?.salarioMensal ? (totalGastos / receita.salarioMensal) * 100 : 0;

  if (!loading && isNewUser) {
    return <WelcomeScreen userId={id} onReceitaSave={handleReceitaUpdate} />;
  }

  return (
    <div className="p-6 space-y-6">
      
      <p className="text-muted-foreground">Aqui você terá acesso as informações financeiras e poderá gerenciar seus cofrinhos virtuais.</p>

      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <FinancialSummaryCards
            receita={receita}
            totalDespesas={totalDespesas}
            totalDividas={totalDividas}
            saldoDisponivel={saldoDisponivel}
            onReceitaUpdate={handleReceitaUpdate}
          />

          <BudgetProgressCard percentualGasto={percentualGasto} />

          <FinancialTabs
            userId={id}
            dividasFixas={dividasFixas}
            despesasMensais={despesasMensais}
            parcelas={parcelas}
            onDividasUpdate={handleDividasUpdate}
            onDespesasUpdate={handleDespesasUpdate}
          />
        </>
      )}
    </div>
  );
}
