"use client";

import { useState, useEffect } from 'react';
import { Cofrinho, TipoDesafio } from '../../types/types';
import { finalizarDesafio, cumprirDesafioDoDia } from '../../actions/actions';
import { Trophy, Calendar, CheckCircle, Plus, Check, PartyPopper, Award, X } from 'lucide-react';
import { DesafioForm } from '../DesafioForm/DesafioForm';
import dynamic from 'next/dynamic';
import { marcarRecompensaMostrada, recompensaJaMostrada, verificarNotificacaoNaSessao, marcarNotificacaoNaSessao } from '../../utils/notificacoes';

// Importar react-confetti de forma dinâmica para evitar problemas de SSR
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface DesafiosListProps {
  cofrinhos: Cofrinho[];
  onUpdate: () => void;
  allCofrinhos: Cofrinho[]; // Todos os cofrinhos, incluindo os sem desafio
}

// Componente de notificação de recompensa
interface RecompensaNotificacaoProps {
  cofrinho: Cofrinho;
  onClose: () => void;
}

function RecompensaNotificacao({ cofrinho, onClose }: RecompensaNotificacaoProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Obter dimensões da janela para o confete
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Inicializar tamanho
    updateWindowSize();

    // Atualizar quando a janela for redimensionada
    window.addEventListener('resize', updateWindowSize);

    // Marcar a recompensa como mostrada
    marcarRecompensaMostrada(cofrinho);
    // Marcar que já mostramos esta notificação nesta sessão
    if (cofrinho.id) {
      marcarNotificacaoNaSessao(cofrinho.id);
    }

    // Fechar automaticamente após 5 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Esconder confete após 4 segundos
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [onClose, cofrinho]);

  // Calcular valor depositado
  const valorDepositado = cofrinho.desafio?.valorHoje || 0;

  return (
    <>
      {showConfetti && windowSize.width > 0 && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']}
        />
      )}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm w-full border border-green-300 animate-slide-up z-50">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
            <PartyPopper className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Parabéns! 🎉
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Você cumpriu o desafio de hoje para o cofrinho <strong>{cofrinho.nome}</strong>!
            </p>
            <p className="mt-1 text-sm text-green-600 font-semibold">
              + R$ {valorDepositado.toFixed(2)} depositados
            </p>
            <div className="mt-2 flex">
              <button
                onClick={() => {
                  // Marcar a recompensa como mostrada ao fechar manualmente
                  marcarRecompensaMostrada(cofrinho);
                  // Marcar que já mostramos esta notificação nesta sessão
                  if (cofrinho.id) {
                    marcarNotificacaoNaSessao(cofrinho.id);
                  }
                  onClose();
                }}
                className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-100 focus:outline-none"
              >
                Fechar
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              // Marcar a recompensa como mostrada ao fechar manualmente
              marcarRecompensaMostrada(cofrinho);
              // Marcar que já mostramos esta notificação nesta sessão
              if (cofrinho.id) {
                marcarNotificacaoNaSessao(cofrinho.id);
              }
              onClose();
            }}
            className="flex-shrink-0 ml-0.5 h-5 w-5 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Fechar</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function DesafiosList({ cofrinhos, onUpdate, allCofrinhos }: DesafiosListProps) {
  const [desafioParaFinalizar, setDesafioParaFinalizar] = useState<Cofrinho | null>(null);
  const [confirmandoFinalizacao, setConfirmandoFinalizacao] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [isAddingDesafio, setIsAddingDesafio] = useState(false);
  const [isCumprindoDesafio, setIsCumprindoDesafio] = useState(false);
  const [desafioCumprido, setDesafioCumprido] = useState<string | null>(null);
  const [cofrinhoRecompensado, setCofrinhoRecompensado] = useState<Cofrinho | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Obter dimensões da janela para o confete
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Inicializar tamanho
    updateWindowSize();

    // Atualizar quando a janela for redimensionada
    window.addEventListener('resize', updateWindowSize);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  const handleConfirmarFinalizacao = (cofrinho: Cofrinho) => {
    setDesafioParaFinalizar(cofrinho);
    setConfirmandoFinalizacao(true);
  };

  const handleCancelarFinalizacao = () => {
    setDesafioParaFinalizar(null);
    setConfirmandoFinalizacao(false);
  };

  const handleFinalizarDesafio = async () => {
    if (!desafioParaFinalizar) return;

    try {
      setIsFinalizando(true);
      await finalizarDesafio(desafioParaFinalizar.id as string);
      setDesafioParaFinalizar(null);
      setConfirmandoFinalizacao(false);
      onUpdate();
    } catch (error) {
      console.error("Erro ao finalizar desafio:", error);
    } finally {
      setIsFinalizando(false);
    }
  };

  const handleCumprirDesafio = async (cofrinhoId: string) => {
    try {
      setIsCumprindoDesafio(true);

      // Chamar a função para cumprir o desafio do dia
      await cumprirDesafioDoDia(cofrinhoId);

      // Marcar como cumprido para mostrar feedback visual
      setDesafioCumprido(cofrinhoId);

      // Atualizar a lista de cofrinhos para obter os dados atualizados
      onUpdate();

      // Aguardar um momento para garantir que os dados foram atualizados
      setTimeout(() => {
        // Encontrar o cofrinho que foi atualizado para mostrar na notificação
        const cofrinhoAtualizado = cofrinhos.find(c => c.id === cofrinhoId);

        if (cofrinhoAtualizado) {
          // Verificar se a recompensa já foi mostrada antes de exibi-la
          // e se já foi mostrada nesta sessão
          const cofrinhoId = cofrinhoAtualizado.id || '';
          if (!recompensaJaMostrada(cofrinhoAtualizado) && !verificarNotificacaoNaSessao(cofrinhoId)) {
            // Mostrar notificação de recompensa
            setCofrinhoRecompensado(cofrinhoAtualizado);
            // Marcar que já mostramos esta notificação nesta sessão
            marcarNotificacaoNaSessao(cofrinhoId);
          }

          // Verificar se o desafio foi completamente cumprido
          if (cofrinhoAtualizado.desafio &&
              cofrinhoAtualizado.desafio.diaAtual >= cofrinhoAtualizado.desafio.duracaoDias) {
            // Desafio completado totalmente! Mostrar modal de confirmação
            setTimeout(() => {
              setDesafioParaFinalizar(cofrinhoAtualizado);
              setConfirmandoFinalizacao(true);
            }, 1500); // Mostrar após 1.5 segundos para dar tempo de ver a notificação
          }
        }
      }, 500);

      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setDesafioCumprido(null);
      }, 3000);
    } catch (error) {
      console.error("Erro ao cumprir desafio do dia:", error);
    } finally {
      setIsCumprindoDesafio(false);
    }
  };
  if (cofrinhos.length === 0) {
    return (
      <div className="bg-card rounded-lg p-4 shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Seus Desafios</h2>
          <button
            onClick={() => setIsAddingDesafio(true)}
            className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Criar Desafio
          </button>
        </div>

        {isAddingDesafio ? (
          <DesafioForm
            cofrinhos={allCofrinhos}
            onSave={() => {
              setIsAddingDesafio(false);
              onUpdate();
            }}
            onCancel={() => setIsAddingDesafio(false)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Você não tem desafios ativos. Crie um desafio para começar!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Seus Desafios</h2>
        <button
          onClick={() => setIsAddingDesafio(true)}
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Criar Desafio
        </button>
      </div>

      {isAddingDesafio && (
        <DesafioForm
          cofrinhos={allCofrinhos}
          onSave={() => {
            setIsAddingDesafio(false);
            onUpdate();
          }}
          onCancel={() => setIsAddingDesafio(false)}
        />
      )}

      {/* Modal de confirmação para finalizar desafio */}
      {confirmandoFinalizacao && desafioParaFinalizar && desafioParaFinalizar.desafio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {desafioParaFinalizar.desafio.diaAtual >= desafioParaFinalizar.desafio.duracaoDias && windowSize.width > 0 && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={true}
              numberOfPieces={300}
              gravity={0.2}
              colors={['#FFD700', '#FFA500', '#FF4500', '#32CD32', '#1E90FF']}
            />
          )}
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            {desafioParaFinalizar.desafio.diaAtual >= desafioParaFinalizar.desafio.duracaoDias ? (
              <>
                <h3 className="text-lg font-bold mb-2 text-green-600 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Parabéns! Desafio Completo!
                </h3>
                <p className="mb-4">
                  Você completou todos os dias do desafio <strong>{desafioParaFinalizar.desafio.tipo}</strong> do cofrinho <strong>{desafioParaFinalizar.nome}</strong>!
                  Clique em "Finalizar" para encerrar o desafio e receber sua conquista.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">Confirmar finalização</h3>
                <p className="mb-4">
                  Tem certeza que deseja finalizar o desafio <strong>{desafioParaFinalizar.desafio.tipo}</strong> do cofrinho <strong>{desafioParaFinalizar.nome}</strong>?
                  O desafio será marcado como concluído e você receberá uma conquista.
                </p>
              </>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelarFinalizacao}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                disabled={isFinalizando}
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarDesafio}
                className={`px-4 py-2 rounded-md hover:bg-primary/90 transition-colors ${
                  desafioParaFinalizar.desafio.diaAtual >= desafioParaFinalizar.desafio.duracaoDias
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-primary text-primary-foreground"
                }`}
                disabled={isFinalizando}
              >
                {isFinalizando ? "Finalizando..." : "Finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Filtrar apenas cofrinhos com desafios ativos */}
        {cofrinhos.filter(cofrinho => cofrinho.desafio && cofrinho.desafio.ativo === true).length > 0 ? (
          cofrinhos.map((cofrinho) => {
            if (!cofrinho.desafio || cofrinho.desafio.ativo !== true) return null;

            const desafio = cofrinho.desafio;
            const progresso = (desafio.diaAtual / desafio.duracaoDias) * 100;

            return (
              <div key={cofrinho.id} className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium flex items-center">
                    <span className="mr-1">{cofrinho.icone}</span> {cofrinho.nome}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {desafio.tipo}
                  </span>
                </div>

                <div className="text-sm mb-2">
                  <p className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {desafio.tipo === TipoDesafio.SEMANAL_FIXO ? (
                      <>Semana {Math.ceil(desafio.diaAtual / 7)} de {Math.ceil(desafio.duracaoDias / 7)}</>
                    ) : (
                      <>Dia {desafio.diaAtual} de {desafio.duracaoDias}</>
                    )}
                  </p>
                  <p className="flex items-center">
                    <Trophy className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Valor hoje: R$ {desafio.valorHoje.toFixed(2)}
                  </p>
                </div>

                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${progresso}%` }}
                  />
                </div>

                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => handleCumprirDesafio(cofrinho.id as string)}
                    className={`text-xs px-2 py-1 rounded-md flex items-center transition-all duration-300 ${
                      desafioCumprido === cofrinho.id
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    title={desafio.tipo === TipoDesafio.SEMANAL_FIXO ? "Marcar semana como cumprida" : "Marcar como cumprido hoje"}
                    disabled={isCumprindoDesafio || desafioCumprido === cofrinho.id}
                  >
                    <Check className={`h-4 w-4 mr-1 ${desafioCumprido === cofrinho.id ? "animate-bounce" : ""}`} />
                    {desafioCumprido === cofrinho.id ? "Cumprido!" :
                      desafio.tipo === TipoDesafio.SEMANAL_FIXO ? "Cumprir semana" : "Cumprir hoje"}
                  </button>

                  <button
                    onClick={() => handleConfirmarFinalizacao(cofrinho)}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md flex items-center"
                    title="Finalizar desafio"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Você não possui desafios ativos no momento.</p>
            <p className="text-sm mt-1">
              {!isAddingDesafio && (
                <button
                  onClick={() => setIsAddingDesafio(true)}
                  className="text-primary hover:underline"
                >
                  Clique aqui
                </button>
              )} para adicionar um desafio a um cofrinho existente.
            </p>
          </div>
        )}
      </div>

      {/* Notificação de recompensa */}
      {cofrinhoRecompensado && (
        <RecompensaNotificacao
          cofrinho={cofrinhoRecompensado}
          onClose={() => {
            // Marcar a recompensa como já mostrada
            if (cofrinhoRecompensado && cofrinhoRecompensado.id) {
              marcarRecompensaMostrada(cofrinhoRecompensado);
              // Marcar que já mostramos esta notificação nesta sessão
              marcarNotificacaoNaSessao(cofrinhoRecompensado.id);
            }
            setCofrinhoRecompensado(null);
          }}
        />
      )}
    </div>
  );
}