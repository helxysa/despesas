"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { DespesaMensal } from '../../types/types';

interface DespesasMensaisTabProps {
  despesasMensais: DespesaMensal[];
}

export function DespesasMensaisTab({ despesasMensais }: DespesasMensaisTabProps) {
  return (
    <TabsContent value="despesas" className="space-y-4 mt-4">
      {despesasMensais.length > 0 ? (
        despesasMensais.map((despesa) => (
          <Card key={despesa.id}>
            <CardHeader className="pb-2">
              <CardTitle>{despesa.nome}</CardTitle>
              {despesa.dataPrevistaPagamento && (
                <CardDescription>
                  Vencimento: {despesa.dataPrevistaPagamento.toLocaleDateString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">R$ {despesa.valor.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground">Nenhuma despesa mensal cadastrada</p>
      )}
    </TabsContent>
  );
}
