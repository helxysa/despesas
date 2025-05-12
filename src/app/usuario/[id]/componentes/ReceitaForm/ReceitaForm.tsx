"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Receita } from '../../types/types';
import { adicionarReceita, atualizarReceita, obterReceita } from '../../actions/actions';

// Esquema de validação para o formulário de receita
const receitaSchema = z.object({
  salarioMensal: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Informe um valor válido maior que zero" }
  ),
});

type ReceitaFormValues = z.infer<typeof receitaSchema>;

interface ReceitaFormProps {
  userId: string;
  receita: Receita | null;
  onSave: (receita: Receita) => void;
  onCancel?: () => void;
  isCompact?: boolean;
}

export function ReceitaForm({ userId, receita, onSave, onCancel, isCompact = false }: ReceitaFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar formulário
  const form = useForm<ReceitaFormValues>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      salarioMensal: receita?.salarioMensal ? receita.salarioMensal.toString() : "",
    },
  });

  // Função para salvar a receita
  const onSubmit = async (data: ReceitaFormValues) => {
    try {
      setIsSaving(true);
      const salarioMensal = parseFloat(data.salarioMensal);
      
      if (receita?.id) {
        // Atualizar receita existente
        await atualizarReceita(receita.id, salarioMensal);
      } else {
        // Adicionar nova receita
        await adicionarReceita(userId, salarioMensal);
      }
      
      // Recarregar dados
      const receitaAtualizada = await obterReceita(userId);
      if (receitaAtualizada) {
        onSave(receitaAtualizada);
      }
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="salarioMensal"
          render={({ field }) => (
            <FormItem>
              {!isCompact && <FormLabel>Valor Mensal (R$)</FormLabel>}
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  {...field} 
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isCompact ? (
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSaving}
            >
              Salvar
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            )}
          </div>
        ) : (
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar e Continuar"}
          </Button>
        )}
      </form>
    </Form>
  );
}
