"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DividasFixasTab } from '../DividasFixasTab/DividasFixasTab';
import { DespesasMensaisTab } from '../DespesasMensaisTab/DespesasMensaisTab';
import { ParcelasMesTab } from '../ParcelasMesTab/ParcelasMesTab';
import { DividaFixa, DespesaMensal, ParcelaMes } from '../../types/types';

interface FinancialTabsProps {
  userId: string;
  dividasFixas: DividaFixa[];
  despesasMensais: DespesaMensal[];
  parcelas: ParcelaMes[];
  onDividasUpdate: (dividasFixas: DividaFixa[]) => void;
  onDespesasUpdate: (despesasMensais: DespesaMensal[]) => void;
}

export function FinancialTabs({
  userId,
  dividasFixas,
  despesasMensais,
  parcelas,
  onDividasUpdate,
  onDespesasUpdate
}: FinancialTabsProps) {
  return (
    <Tabs defaultValue="dividas">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dividas">Dívidas Fixas</TabsTrigger>
        <TabsTrigger value="despesas">Despesas Mensais</TabsTrigger>
        <TabsTrigger value="parcelas">Parcelas do Mês</TabsTrigger>
      </TabsList>

      <DividasFixasTab
        userId={userId}
        dividasFixas={dividasFixas}
        onDividasUpdate={onDividasUpdate}
      />
      <DespesasMensaisTab
        userId={userId}
        despesasMensais={despesasMensais}
        onDespesasUpdate={onDespesasUpdate}
      />
      <ParcelasMesTab parcelas={parcelas} />
    </Tabs>
  );
}
