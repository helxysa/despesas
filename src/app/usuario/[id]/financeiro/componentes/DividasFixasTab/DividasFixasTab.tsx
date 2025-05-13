"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DividaFixa } from '../../types/types';
import { DividaFixaForm } from '../DividaFixaForm/DividaFixaForm';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog/ConfirmDeleteDialog';
import { obterDividasFixas, removerDividaFixa } from '../../actions/actions';

interface DividasFixasTabProps {
  dividasFixas: DividaFixa[];
  userId: string;
  onDividasUpdate: (dividasFixas: DividaFixa[]) => void;
}

export function DividasFixasTab({ dividasFixas, userId, onDividasUpdate }: DividasFixasTabProps) {
  const [isAddingDivida, setIsAddingDivida] = useState(false);
  const [isEditingDivida, setIsEditingDivida] = useState(false);
  const [isDeletingDivida, setIsDeletingDivida] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<DividaFixa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddDivida = () => {
    setSelectedDivida(null);
    setIsAddingDivida(true);
  };

  const handleEditDivida = (divida: DividaFixa) => {
    setSelectedDivida(divida);
    setIsEditingDivida(true);
  };

  const handleDeleteDivida = (divida: DividaFixa) => {
    setSelectedDivida(divida);
    setIsDeletingDivida(true);
  };

  const handleSaveDivida = (dividasAtualizadas: DividaFixa[]) => {
    onDividasUpdate(dividasAtualizadas);
    setIsAddingDivida(false);
    setIsEditingDivida(false);
    setSelectedDivida(null);
  };

  const handleCancelDivida = () => {
    setIsAddingDivida(false);
    setIsEditingDivida(false);
    setIsDeletingDivida(false);
    setSelectedDivida(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDivida?.id) return;

    try {
      setIsDeleting(true);
      await removerDividaFixa(selectedDivida.id);
      const dividasAtualizadas = await obterDividasFixas(userId);
      onDividasUpdate(dividasAtualizadas);
    } catch (error) {
      console.error("Erro ao excluir dívida fixa:", error);
    } finally {
      setIsDeleting(false);
      setIsDeletingDivida(false);
      setSelectedDivida(null);
    }
  };

  return (
    <TabsContent value="dividas" className="space-y-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Suas Dívidas Fixas</h3>
        <Button onClick={handleAddDivida} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Adicionar Dívida
        </Button>
      </div>

      {isAddingDivida && (
        <DividaFixaForm
          userId={userId}
          onSave={handleSaveDivida}
          onCancel={handleCancelDivida}
        />
      )}

      {isEditingDivida && selectedDivida && (
        <DividaFixaForm
          userId={userId}
          divida={selectedDivida}
          onSave={handleSaveDivida}
          onCancel={handleCancelDivida}
        />
      )}

      {isDeletingDivida && selectedDivida && (
        <ConfirmDeleteDialog
          title="Excluir Dívida"
          message={`Tem certeza que deseja excluir a dívida "${selectedDivida.nome}"? Esta ação não pode ser desfeita e todas as parcelas associadas serão removidas.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDivida}
          isDeleting={isDeleting}
        />
      )}

      {dividasFixas.length > 0 ? (
        dividasFixas.map((divida) => (
          <Card key={divida.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{divida.nome}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <span>{divida.parcelasPagas}/{divida.numeroParcelas} parcelas pagas</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(divida.parcelasPagas / divida.numeroParcelas) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditDivida(divida)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDivida(divida)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                <div>
                  <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                  <p className="text-lg font-medium">R$ {divida.valorParcela.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center p-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">Nenhuma dívida fixa cadastrada</p>
          <Button onClick={handleAddDivida} variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar sua primeira dívida
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
