"use client";

import { useState, useEffect } from 'react';
import { Cofrinho, MetodoDeposito, ConquistaCofrinho } from '../../types/types';
import { adicionarDeposito, apagarCofrinho } from '../../actions/actions';
import { DepositoForm } from '../DepositoForm/DepositoForm';
import { ConquistaNotificacao } from '../ConquistaNotificacao/ConquistaNotificacao';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import { conquistaJaMostrada, marcarConquistaMostrada, verificarNotificacaoNaSessao, marcarNotificacaoNaSessao } from '../../utils/notificacoes';

interface CofrinhosListProps {
  cofrinhos: Cofrinho[];
  onSelectCofrinho: (cofrinho: Cofrinho) => void;
  onUpdate: () => void;
  userId: string;
}

export function CofrinhosList({ cofrinhos, onSelectCofrinho, onUpdate, userId }: CofrinhosListProps) {
  const [depositoCofrinho, setDepositoCofrinho] = useState<Cofrinho | null>(null);
  const [isAddingDeposito, setIsAddingDeposito] = useState(false);
  const [cofrinhoParaApagar, setCofrinhoParaApagar] = useState<Cofrinho | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [conquistaAtual, setConquistaAtual] = useState<ConquistaCofrinho | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verificar se há conquistas nos cofrinhos para mostrar como notificações
  // Usar uma ref para controlar se já verificamos as conquistas nesta sessão
  const [verificouConquistas, setVerificouConquistas] = useState(false);

  useEffect(() => {
    // Evitar verificar conquistas mais de uma vez por sessão
    if (verificouConquistas) return;

    // Procurar por conquistas recentes (últimas 24 horas)
    const agora = new Date();
    const ontem = new Date(agora);
    ontem.setDate(ontem.getDate() - 1);

    // Percorrer todos os cofrinhos e suas conquistas
    for (const cofrinho of cofrinhos) {
      if (cofrinho.conquistas && cofrinho.conquistas.length > 0) {
        // Encontrar conquistas recentes que ainda não foram mostradas no localStorage
        // e que não foram mostradas nesta sessão
        const conquistasRecentes = cofrinho.conquistas
          .filter(c => {
            // Verificar se é recente (últimas 24 horas)
            const isRecente = c.data > ontem;
            // Verificar se já foi mostrada em sessões anteriores (localStorage)
            const naoMostradaAntes = !conquistaJaMostrada(c);
            // Verificar se já foi mostrada nesta sessão (sessionStorage)
            const naoMostradaNaSessao = !verificarNotificacaoNaSessao(c.id || '');

            return isRecente && naoMostradaAntes && naoMostradaNaSessao;
          })
          .sort((a, b) => b.data.getTime() - a.data.getTime());

        if (conquistasRecentes.length > 0) {
          const conquistaParaMostrar = conquistasRecentes[0];
          setConquistaAtual(conquistaParaMostrar);
          // Marcar que já verificamos as conquistas nesta sessão
          setVerificouConquistas(true);
          break;
        }
      }
    }

    // Marcar que já verificamos as conquistas mesmo se não encontramos nenhuma
    setVerificouConquistas(true);
  }, [cofrinhos, verificouConquistas]);

  const handleAddDeposito = (cofrinho: Cofrinho) => {
    setDepositoCofrinho(cofrinho);
    setIsAddingDeposito(true);
  };

  const handleConfirmarExclusao = (cofrinho: Cofrinho) => {
    setCofrinhoParaApagar(cofrinho);
    setConfirmandoExclusao(true);
  };

  const handleCancelarExclusao = () => {
    setCofrinhoParaApagar(null);
    setConfirmandoExclusao(false);
  };

  const handleApagarCofrinho = async () => {
    if (!cofrinhoParaApagar) return;

    try {
      setIsDeleting(true);
      await apagarCofrinho(cofrinhoParaApagar.id as string);
      setCofrinhoParaApagar(null);
      setConfirmandoExclusao(false);
      onUpdate();
    } catch (error) {
      console.error("Erro ao apagar cofrinho:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDepositoSave = async (valor: number, origemReceita: boolean, descricao?: string) => {
    if (!depositoCofrinho) return;

    try {
      // Limpar mensagens de erro anteriores
      setErrorMessage(null);

      const resultado = await adicionarDeposito(
        depositoCofrinho.id as string,
        valor,
        origemReceita,
        MetodoDeposito.MANUAL,
        descricao
      );

      // Se o resultado for null, significa que o cofrinho já atingiu 100% da meta
      if (resultado === null) {
        setErrorMessage("Este cofrinho já atingiu 100% da meta. Não é possível adicionar mais depósitos.");
        // Fechar o formulário após 3 segundos
        setTimeout(() => {
          setIsAddingDeposito(false);
          setDepositoCofrinho(null);
          setErrorMessage(null);
        }, 3000);
        return;
      }

      setIsAddingDeposito(false);
      setDepositoCofrinho(null);
      onUpdate();
    } catch (error) {
      console.error("Erro ao adicionar depósito:", error);
      setErrorMessage("Ocorreu um erro ao adicionar o depósito. Tente novamente.");
    }
  };

  const handleDepositoCancel = () => {
    setIsAddingDeposito(false);
    setDepositoCofrinho(null);
    setErrorMessage(null);
  };

  if (cofrinhos.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Nenhum cofrinho encontrado</h2>
        <p className="text-muted-foreground mb-4">
          Crie seu primeiro cofrinho para começar a poupar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mensagem de erro */}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded animate-fade-in">
          <p>{errorMessage}</p>
        </div>
      )}

      {isAddingDeposito && depositoCofrinho && (
        <DepositoForm
          cofrinho={depositoCofrinho}
          onSave={handleDepositoSave}
          onCancel={handleDepositoCancel}
        />
      )}

      {/* Modal de confirmação para apagar cofrinho */}
      {confirmandoExclusao && cofrinhoParaApagar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirmar exclusão</h3>
            <p className="mb-4">
              Tem certeza que deseja apagar o cofrinho <strong>{cofrinhoParaApagar.nome}</strong>?
              Esta ação não pode ser desfeita e todos os depósitos e conquistas relacionados serão excluídos.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelarExclusao}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleApagarCofrinho}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? "Apagando..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cofrinhos.map((cofrinho) => (
          <div
            key={cofrinho.id}
            className="bg-card rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold flex items-center">
                <span className="mr-2">{cofrinho.icone}</span>
                {cofrinho.nome}
              </h3>
              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: cofrinho.cor ? `${cofrinho.cor}20` : '#FF950020',
                  color: cofrinho.cor || '#FF9500'
                }}
              >
                {cofrinho.categoria}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Meta: R$ {cofrinho.meta.toFixed(2)}</span>
                <span>{cofrinho.progresso.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${cofrinho.progresso}%`,
                    backgroundColor: cofrinho.cor || '#FF9500'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Valor atual</p>
                <p className="text-lg font-medium">R$ {cofrinho.valorAtual.toFixed(2)}</p>
              </div>
              {cofrinho.desafio && cofrinho.desafio.ativo === true && (
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Desafio Ativo
                </div>
              )}
            </div>

            <div className="flex space-x-2 mb-2">
              <button
                onClick={() => onSelectCofrinho(cofrinho)}
                className="flex-1 bg-muted hover:bg-muted/80 text-sm px-3 py-1.5 rounded-md transition-colors flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </button>
              <button
                onClick={() => handleAddDeposito(cofrinho)}
                className={`flex-1 text-sm px-3 py-1.5 rounded-md transition-colors flex items-center justify-center ${
                  cofrinho.progresso >= 100
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                disabled={cofrinho.progresso >= 100}
                title={cofrinho.progresso >= 100 ? "Meta atingida! Não é necessário mais depósitos." : "Adicionar depósito"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {cofrinho.progresso >= 100 ? "Meta atingida" : "Depositar"}
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleConfirmarExclusao(cofrinho)}
                className="p-1.5 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100/20"
                title="Apagar cofrinho"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSelectCofrinho(cofrinho)}
                className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-100/20"
                title="Editar cofrinho"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notificação de conquista */}
      {conquistaAtual && (
        <ConquistaNotificacao
          conquista={conquistaAtual}
          onClose={() => {
            // Marcar a conquista como já mostrada
            if (conquistaAtual && conquistaAtual.id) {
              marcarConquistaMostrada(conquistaAtual);
              // Marcar que já mostramos esta notificação nesta sessão
              marcarNotificacaoNaSessao(conquistaAtual.id);
            }
            setConquistaAtual(null);
          }}
        />
      )}
    </div>
  );
}
