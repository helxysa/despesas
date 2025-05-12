"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DividasFixasTab } from '../DividasFixasTab/DividasFixasTab';
import { DespesasMensaisTab } from '../DespesasMensaisTab/DespesasMensaisTab';
import { ParcelasMesTab } from '../ParcelasMesTab/ParcelasMesTab';
import { DividaFixa, DespesaMensal, ParcelaMes } from '../../types/types';

interface FinancialTabsProps {
  dividasFixas: DividaFixa[];
  despesasMensais: DespesaMensal[];
  parcelas: ParcelaMes[];
}

export function FinancialTabs({ dividasFixas, despesasMensais, parcelas }: FinancialTabsProps) {
  return (
    <Tabs defaultValue="dividas">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dividas">Dívidas Fixas</TabsTrigger>
        <TabsTrigger value="despesas">Despesas Mensais</TabsTrigger>
        <TabsTrigger value="parcelas">Parcelas do Mês</TabsTrigger>
      </TabsList>
      
      <DividasFixasTab dividasFixas={dividasFixas} />
      <DespesasMensaisTab despesasMensais={despesasMensais} />
      <ParcelasMesTab parcelas={parcelas} />
    </Tabs>
  );
}
