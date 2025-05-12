"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { DividaFixa } from '../../types/types';

interface DividasFixasTabProps {
  dividasFixas: DividaFixa[];
}

export function DividasFixasTab({ dividasFixas }: DividasFixasTabProps) {
  return (
    <TabsContent value="dividas" className="space-y-4 mt-4">
      {dividasFixas.length > 0 ? (
        dividasFixas.map((divida) => (
          <Card key={divida.id}>
            <CardHeader className="pb-2">
              <CardTitle>{divida.nome}</CardTitle>
              <CardDescription>
                {divida.parcelasPagas}/{divida.numeroParcelas} parcelas pagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-medium">R$ {divida.valorTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Restante</p>
                  <p className="text-lg font-medium">R$ {divida.valorRestante.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground">Nenhuma dívida fixa cadastrada</p>
      )}
    </TabsContent>
  );
}
