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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DespesaMensal } from '../../types/types';
import { adicionarDespesaMensal, atualizarDespesaMensal, obterDespesasMensais } from '../../actions/actions';

// Esquema de validação para o formulário de despesa mensal
const despesaMensalSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  valor: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Informe um valor válido maior que zero" }
  ),
  dataPrevistaPagamento: z.string().optional(),
});

type DespesaMensalFormValues = z.infer<typeof despesaMensalSchema>;

interface DespesaMensalFormProps {
  userId: string;
  despesa?: DespesaMensal | null;
  onSave: (despesasMensais: DespesaMensal[]) => void;
  onCancel: () => void;
}

export function DespesaMensalForm({ userId, despesa, onSave, onCancel }: DespesaMensalFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!despesa;

  // Formatar data para o formato YYYY-MM-DD para o input date
  const formatDateForInput = (date?: Date | null) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  // Inicializar formulário
  const form = useForm<DespesaMensalFormValues>({
    resolver: zodResolver(despesaMensalSchema),
    defaultValues: {
      nome: despesa?.nome || "",
      valor: despesa?.valor ? despesa.valor.toString() : "",
      dataPrevistaPagamento: formatDateForInput(despesa?.dataPrevistaPagamento),
    },
  });

  // Função para salvar a despesa mensal
  const onSubmit = async (data: DespesaMensalFormValues) => {
    try {
      setIsSaving(true);
      const nome = data.nome;
      const valor = parseFloat(data.valor);
      const dataPrevistaPagamento = data.dataPrevistaPagamento 
        ? new Date(data.dataPrevistaPagamento) 
        : undefined;
      
      if (isEditing && despesa?.id) {
        // Atualizar despesa existente
        await atualizarDespesaMensal(
          despesa.id,
          nome,
          valor,
          dataPrevistaPagamento
        );
      } else {
        // Adicionar nova despesa mensal
        await adicionarDespesaMensal(userId, nome, valor, dataPrevistaPagamento);
      }
      
      // Recarregar dados
      const despesasAtualizadas = await obterDespesasMensais(userId);
      onSave(despesasAtualizadas);
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'salvar'} despesa mensal:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar' : 'Adicionar'} Despesa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Despesa</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Conta de Luz" 
                        {...field} 
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
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
              
              <FormField
                control={form.control}
                name="dataPrevistaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Prevista de Pagamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
