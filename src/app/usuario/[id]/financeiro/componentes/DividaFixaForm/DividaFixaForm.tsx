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
import { DividaFixa } from '../../types/types';
import { adicionarDividaFixa, atualizarDividaFixa, obterDividasFixas } from '../../actions/actions';

// Esquema de validação para o formulário de dívida fixa
const dividaFixaSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  valorTotal: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Informe um valor válido maior que zero" }
  ),
  numeroParcelas: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    { message: "Informe um número válido maior que zero" }
  ),
  parcelasPagas: z.string().optional().transform(val => {
    if (!val) return "0";
    return val;
  }).refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
    { message: "Informe um número válido maior ou igual a zero" }
  ),
});

// Definição manual do tipo para garantir que parcelasPagas seja opcional
interface DividaFixaFormValues {
  nome: string;
  valorTotal: string;
  numeroParcelas: string;
  parcelasPagas?: string;
}

interface DividaFixaFormProps {
  userId: string;
  divida?: DividaFixa | null;
  onSave: (dividasFixas: DividaFixa[]) => void;
  onCancel: () => void;
}

export function DividaFixaForm({ userId, divida, onSave, onCancel }: DividaFixaFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!divida;

  // Inicializar formulário
  const form = useForm<DividaFixaFormValues>({
    resolver: zodResolver(dividaFixaSchema),
    defaultValues: {
      nome: divida?.nome || "",
      valorTotal: divida?.valorTotal ? divida.valorTotal.toString() : "",
      numeroParcelas: divida?.numeroParcelas ? divida.numeroParcelas.toString() : "",
      parcelasPagas: divida?.parcelasPagas ? divida.parcelasPagas.toString() : "0",
    },
  });

  // Função para salvar a dívida fixa
  const onSubmit = async (data: DividaFixaFormValues) => {
    try {
      setIsSaving(true);
      const nome = data.nome;
      const valorTotal = parseFloat(data.valorTotal);
      const numeroParcelas = parseInt(data.numeroParcelas);
      const parcelasPagas = parseInt(data.parcelasPagas || "0");

      // Validar que parcelas pagas não seja maior que número de parcelas
      if (parcelasPagas > numeroParcelas) {
        form.setError("parcelasPagas", {
          type: "manual",
          message: "O número de parcelas pagas não pode ser maior que o número total de parcelas"
        });
        setIsSaving(false);
        return;
      }

      if (isEditing && divida?.id) {
        // Atualizar dívida existente
        await atualizarDividaFixa(
          divida.id,
          nome,
          valorTotal,
          numeroParcelas,
          parcelasPagas
        );
      } else {
        // Adicionar nova dívida fixa
        await adicionarDividaFixa(userId, nome, valorTotal, numeroParcelas);
      }

      // Recarregar dados
      const dividasAtualizadas = await obterDividasFixas(userId);
      onSave(dividasAtualizadas);
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'salvar'} dívida fixa:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar' : 'Adicionar'} Dívida Fixa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Dívida</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Financiamento do Carro"
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
                name="valorTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
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
                name="numeroParcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="12"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="parcelasPagas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas Pagas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
