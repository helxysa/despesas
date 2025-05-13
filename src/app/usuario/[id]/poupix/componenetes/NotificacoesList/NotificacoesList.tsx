"use client";

import { useState } from 'react';
import { Cofrinho, NotificacaoEconomia } from '../../types/types';
import { marcarNotificacaoComoLida, aplicarSugestaoEconomia } from '../../actions/actions';

interface NotificacoesListProps {
  notificacoes: NotificacaoEconomia[];
  cofrinhos: Cofrinho[];
  onUpdate: () => void;
}

export function NotificacoesList({ notificacoes, cofrinhos, onUpdate }: NotificacoesListProps) {
  const [selectedNotificacao, setSelectedNotificacao] = useState<NotificacaoEconomia | null>(null);
  const [selectedCofrinho, setSelectedCofrinho] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  const handleAplicarEconomia = async () => {
    if (!selectedNotificacao || !selectedCofrinho) return;
    
    try {
      setIsApplying(true);
      await aplicarSugestaoEconomia(
        selectedNotificacao.id as string,
        selectedCofrinho
      );
      
      setSelectedNotificacao(null);
      setSelectedCofrinho('');
      onUpdate();
    } catch (error) {
      console.error("Erro ao aplicar economia:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleIgnorar = async (notificacao: NotificacaoEconomia) => {
    try {
      await marcarNotificacaoComoLida(notificacao.id as string);
      onUpdate();
    } catch (error) {
      console.error("Erro ao ignorar notificação:", error);
    }
  };

  if (notificacoes.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 shadow-sm border">
        <h2 className="text-lg font-bold mb-2">Dicas de Economia</h2>
        <p className="text-sm text-muted-foreground">
          Nenhuma dica de economia disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <h2 className="text-lg font-bold mb-4">Dicas de Economia</h2>
      
      {selectedNotificacao ? (
        <div className="space-y-4">
          <div className="bg-primary/10 p-3 rounded-md">
            <p className="text-sm">{selectedNotificacao.mensagem}</p>
            <p className="text-sm font-medium mt-1">
              Valor sugerido: R$ {selectedNotificacao.valorSugerido.toFixed(2)}
            </p>
          </div>
          
          <div>
            <label htmlFor="cofrinho" className="block text-sm font-medium mb-1">
              Escolha um cofrinho para depositar
            </label>
            <select
              id="cofrinho"
              value={selectedCofrinho}
              onChange={(e) => setSelectedCofrinho(e.target.value)}
              className="w-full p-2 border rounded-md mb-3"
            >
              <option value="">Selecione um cofrinho</option>
              {cofrinhos.map((cofrinho) => (
                <option key={cofrinho.id} value={cofrinho.id}>
                  {cofrinho.icone} {cofrinho.nome}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedNotificacao(null)}
                className="flex-1 px-3 py-1.5 border rounded-md text-sm hover:bg-muted transition-colors"
                disabled={isApplying}
              >
                Cancelar
              </button>
              <button
                onClick={handleAplicarEconomia}
                className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                disabled={!selectedCofrinho || isApplying}
              >
                {isApplying ? "Aplicando..." : "Aplicar Economia"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notificacao) => (
            <div key={notificacao.id} className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">{notificacao.mensagem}</p>
              <p className="text-sm font-medium mt-1">
                Valor: R$ {notificacao.valorSugerido.toFixed(2)}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleIgnorar(notificacao)}
                  className="text-xs px-2 py-1 border rounded-md hover:bg-muted transition-colors"
                >
                  Ignorar
                </button>
                <button
                  onClick={() => setSelectedNotificacao(notificacao)}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Poupar Agora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
