"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceitaForm } from '../ReceitaForm/ReceitaForm';
import { Receita } from '../../types/types';

interface WelcomeScreenProps {
  userId: string;
  onReceitaSave: (receita: Receita) => void;
}

export function WelcomeScreen({ userId, onReceitaSave }: WelcomeScreenProps) {
  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Bem-vindo!</h1>
      <p className="text-muted-foreground">Para começar, informe sua receita mensal:</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Informe seu salário ou renda mensal total</CardDescription>
        </CardHeader>
        <CardContent>
          <ReceitaForm 
            userId={userId}
            receita={null}
            onSave={onReceitaSave}
          />
        </CardContent>
      </Card>
      
      <p className="text-sm text-center text-muted-foreground">
        Você poderá cadastrar suas despesas e dívidas depois.
      </p>
    </div>
  );
}
