"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetProgressCardProps {
  percentualGasto: number;
}

export function BudgetProgressCard({ percentualGasto }: BudgetProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento Mensal</CardTitle>
        <CardDescription>Visão geral do seu orçamento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">Gasto</div>
              <div>{percentualGasto.toFixed(0)}%</div>
            </div>
            <Progress value={percentualGasto} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
