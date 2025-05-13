"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ParcelaMes } from '../../types/types';

interface ParcelasMesTabProps {
  parcelas: ParcelaMes[];
}

export function ParcelasMesTab({ parcelas }: ParcelasMesTabProps) {
  return (
    <TabsContent value="parcelas" className="space-y-4 mt-4">
      {parcelas.length > 0 ? (
        parcelas.map((parcela) => (
          <Card key={parcela.id}>
            <CardHeader className="pb-2">
              <CardTitle>{parcela.nome}</CardTitle>
              <CardDescription>
                Parcela {parcela.numeroParcela} - Vencimento: {parcela.dataVencimento.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium">R$ {parcela.valorParcela.toFixed(2)}</p>
                <div className={`px-2 py-1 rounded-full text-xs ${parcela.paga ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {parcela.paga ? 'Paga' : 'Pendente'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground">Nenhuma parcela para este mês</p>
      )}
    </TabsContent>
  );
}
