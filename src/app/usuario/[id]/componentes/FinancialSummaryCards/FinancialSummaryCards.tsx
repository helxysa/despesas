"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receita } from '../../types/types';
import { ReceitaForm } from '../ReceitaForm/ReceitaForm';

interface FinancialSummaryCardsProps {
  receita: Receita | null;
  totalDespesas: number;
  totalDividas: number;
  saldoDisponivel: number;
  onReceitaUpdate: (receita: Receita) => void;
}

export function FinancialSummaryCards({ 
  receita, 
  totalDespesas, 
  totalDividas, 
  saldoDisponivel,
  onReceitaUpdate
}: FinancialSummaryCardsProps) {
  const [isEditingReceita, setIsEditingReceita] = useState(false);

  const handleReceitaSave = (receitaAtualizada: Receita) => {
    onReceitaUpdate(receitaAtualizada);
    setIsEditingReceita(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              {receita?.salarioMensal ? `R$ ${receita.salarioMensal.toFixed(2)}` : 'Não cadastrado'}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditingReceita(true)}
            >
              Editar
            </Button>
          </div>
          
          {isEditingReceita && receita && (
            <div className="mt-4">
              <ReceitaForm 
                userId={receita.userId}
                receita={receita}
                onSave={handleReceitaSave}
                onCancel={() => setIsEditingReceita(false)}
                isCompact={true}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">
            R$ {totalDespesas.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dívidas Fixas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            R$ {totalDividas.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldoDisponivel >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            R$ {saldoDisponivel.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
