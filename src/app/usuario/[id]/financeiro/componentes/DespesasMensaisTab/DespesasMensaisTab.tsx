"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DespesaMensal } from '../../types/types';
import { DespesaMensalForm } from '../DespesaMensalForm/DespesaMensalForm';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog/ConfirmDeleteDialog';
import { obterDespesasMensais, removerDespesaMensal } from '../../actions/actions';

interface DespesasMensaisTabProps {
  despesasMensais: DespesaMensal[];
  userId: string;
  onDespesasUpdate: (despesasMensais: DespesaMensal[]) => void;
}

export function DespesasMensaisTab({ despesasMensais, userId, onDespesasUpdate }: DespesasMensaisTabProps) {
  const [isAddingDespesa, setIsAddingDespesa] = useState(false);
  const [isEditingDespesa, setIsEditingDespesa] = useState(false);
  const [isDeletingDespesa, setIsDeletingDespesa] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<DespesaMensal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddDespesa = () => {
    setSelectedDespesa(null);
    setIsAddingDespesa(true);
  };

  const handleEditDespesa = (despesa: DespesaMensal) => {
    setSelectedDespesa(despesa);
    setIsEditingDespesa(true);
  };

  const handleDeleteDespesa = (despesa: DespesaMensal) => {
    setSelectedDespesa(despesa);
    setIsDeletingDespesa(true);
  };

  const handleSaveDespesa = (despesasAtualizadas: DespesaMensal[]) => {
    onDespesasUpdate(despesasAtualizadas);
    setIsAddingDespesa(false);
    setIsEditingDespesa(false);
    setSelectedDespesa(null);
  };

  const handleCancelDespesa = () => {
    setIsAddingDespesa(false);
    setIsEditingDespesa(false);
    setIsDeletingDespesa(false);
    setSelectedDespesa(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDespesa?.id) return;

    try {
      setIsDeleting(true);
      await removerDespesaMensal(selectedDespesa.id);
      const despesasAtualizadas = await obterDespesasMensais(userId);
      onDespesasUpdate(despesasAtualizadas);
    } catch (error) {
      console.error("Erro ao excluir despesa mensal:", error);
    } finally {
      setIsDeleting(false);
      setIsDeletingDespesa(false);
      setSelectedDespesa(null);
    }
  };

  return (
    <TabsContent value="despesas" className="space-y-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Suas Despesas Mensais</h3>
        <Button onClick={handleAddDespesa} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Adicionar Despesa
        </Button>
      </div>

      {isAddingDespesa && (
        <DespesaMensalForm
          userId={userId}
          onSave={handleSaveDespesa}
          onCancel={handleCancelDespesa}
        />
      )}

      {isEditingDespesa && selectedDespesa && (
        <DespesaMensalForm
          userId={userId}
          despesa={selectedDespesa}
          onSave={handleSaveDespesa}
          onCancel={handleCancelDespesa}
        />
      )}

      {isDeletingDespesa && selectedDespesa && (
        <ConfirmDeleteDialog
          title="Excluir Despesa"
          message={`Tem certeza que deseja excluir a despesa "${selectedDespesa.nome}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDespesa}
          isDeleting={isDeleting}
        />
      )}

      {despesasMensais.length > 0 ? (
        despesasMensais.map((despesa) => (
          <Card key={despesa.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{despesa.nome}</CardTitle>
                  {despesa.dataPrevistaPagamento && (
                    <CardDescription>
                      Vencimento: {despesa.dataPrevistaPagamento.toLocaleDateString()}
                    </CardDescription>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditDespesa(despesa)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDespesa(despesa)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-amber-500">R$ {despesa.valor.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center p-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">Nenhuma despesa mensal cadastrada</p>
          <Button onClick={handleAddDespesa} variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar sua primeira despesa
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
