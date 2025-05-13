"use client";

import { useState } from 'react';
import { Cofrinho } from '../../types/types';

interface DepositoFormProps {
  cofrinho: Cofrinho;
  onSave: (valor: number, origemReceita: boolean, descricao?: string) => void;
  onCancel: () => void;
}

export function DepositoForm({ cofrinho, onSave, onCancel }: DepositoFormProps) {
  const [valor, setValor] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [origemReceita, setOrigemReceita] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Verificar se o cofrinho já atingiu 100% da meta
  const metaAtingida = cofrinho.progresso >= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      setError('Informe um valor válido maior que zero');
      return;
    }

    // Verificar se o cofrinho já atingiu 100% da meta
    if (metaAtingida) {
      setError('Este cofrinho já atingiu 100% da meta. Não é possível adicionar mais depósitos.');
      return;
    }

    onSave(parseFloat(valor), origemReceita, descricao);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Depositar em {cofrinho.icone} {cofrinho.nome}
        </h2>

        {metaAtingida && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <p className="font-medium">Atenção!</p>
            <p className="text-sm">Este cofrinho já atingiu 100% da meta. Não é possível adicionar mais depósitos.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="valor" className="block text-sm font-medium mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              id="valor"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                setError('');
              }}
              className="w-full p-2 border rounded-md"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              id="descricao"
              placeholder="Ex: Economia do mês"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-md">
            <p className="text-sm font-medium mb-3">Origem do valor:</p>

            <div className="space-y-3">
              <label className={`flex items-center p-3 rounded-md border-2 transition-colors cursor-pointer ${!origemReceita ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-muted-foreground/40'}`}>
                <input
                  type="radio"
                  name="origem"
                  checked={!origemReceita}
                  onChange={() => setOrigemReceita(false)}
                  className="h-4 w-4 mr-3"
                />
                <div>
                  <span className="text-sm font-medium">Valor extra</span>
                  <p className="text-xs text-muted-foreground mt-1">Não afeta seu saldo disponível mensal</p>
                </div>
              </label>

              <label className={`flex items-center p-3 rounded-md border-2 transition-colors cursor-pointer ${origemReceita ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-muted-foreground/40'}`}>
                <input
                  type="radio"
                  name="origem"
                  checked={origemReceita}
                  onChange={() => setOrigemReceita(true)}
                  className="h-4 w-4 mr-3"
                />
                <div>
                  <span className="text-sm font-medium">Da receita mensal</span>
                  <p className="text-xs text-muted-foreground mt-1">Reduz seu saldo disponível mensal</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Depositar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
