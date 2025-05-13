"use client";

import { useEffect, useState } from 'react';
import {
  obterCofrinhos,
  apagarCofrinho,
  finalizarDesafio
} from '../../actions/actions';
import { Trash2, Edit, CheckCircle, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import {
  Cofrinho
} from '../../types/types';
import { PiggyBank } from 'lucide-react';

// Componentes
import { CofrinhosList } from '../CofrinhosList/CofrinhosList';
import { CofrinhoForm } from '../CofrinhoForm/CofrinhoForm';
import { DesafiosList } from '../DesafiosList/DesafiosList';
import { ConquistasList } from '../ConquistasList/ConquistasList';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

interface PoupixClientProps {
  id: string;
}

export function PoupixClient({ id }: PoupixClientProps) {
  const [cofrinhos, setCofrinhos] = useState<Cofrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCofrinho, setIsAddingCofrinho] = useState(false);
  const [selectedCofrinho, setSelectedCofrinho] = useState<Cofrinho | null>(null);
  const [cofrinhoParaEditar, setCofrinhoParaEditar] = useState<Cofrinho | null>(null);
  const [error, setError] = useState<{message: string, indexUrl?: string} | null>(null);

  // Estados para apagar cofrinho
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para finalizar desafio
  const [confirmandoFinalizacao, setConfirmandoFinalizacao] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [desafioFinalizado, setDesafioFinalizado] = useState(false);

  useEffect(() => {
    // Carregar dados
    carregarDados();
  }, [id]);

  // Função para carregar dados
  const carregarDados = async () => {
    try {
      setError(null);
      setLoading(true);
      const cofrinhosList = await obterCofrinhos(id);

      // Verificar se há desafios ativos
      const desafiosAtivos = cofrinhosList.filter((c: Cofrinho) => c.desafio && c.desafio.ativo === true);
      console.log("Desafios ativos:", desafiosAtivos);

      setCofrinhos(cofrinhosList);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);

      // Verificar se é um erro de índice do Firestore
      if (error.message && error.message.includes("The query requires an index")) {
        // Extrair o URL do índice do erro
        const indexUrl = error.message.match(/(https:\/\/console\.firebase\.google\.com\/[^\s]+)/)?.[1];

        setError({
          message: "É necessário criar um índice no Firestore para esta consulta. Clique no link abaixo, crie o índice e tente novamente em alguns minutos.",
          indexUrl
        });
      } else {
        setError({
          message: "Ocorreu um erro ao carregar os dados. Por favor, tente novamente."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a lista de cofrinhos
  const handleCofrinhosUpdate = () => {
    carregarDados();
    setIsAddingCofrinho(false);
    setCofrinhoParaEditar(null);
    setSelectedCofrinho(null);
  };

  // Função para editar um cofrinho
  const handleEditarCofrinho = (cofrinho: Cofrinho) => {
    setCofrinhoParaEditar(cofrinho);
    setIsAddingCofrinho(true);
  };

  // Função para selecionar um cofrinho
  const handleSelectCofrinho = (cofrinho: Cofrinho) => {
    setSelectedCofrinho(cofrinho);
  };



  // Funções para apagar cofrinho
  const handleConfirmarExclusao = () => {
    if (!selectedCofrinho) return;
    setConfirmandoExclusao(true);
  };

  const handleCancelarExclusao = () => {
    setConfirmandoExclusao(false);
  };

  const handleApagarCofrinho = async () => {
    if (!selectedCofrinho) return;

    try {
      setIsDeleting(true);
      await apagarCofrinho(selectedCofrinho.id as string);
      setSelectedCofrinho(null);
      setConfirmandoExclusao(false);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao apagar cofrinho:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Funções para finalizar desafio
  const handleConfirmarFinalizacao = () => {
    if (!selectedCofrinho || !selectedCofrinho.desafio) return;
    setConfirmandoFinalizacao(true);
  };

  const handleCancelarFinalizacao = () => {
    setConfirmandoFinalizacao(false);
  };

  const handleFinalizarDesafio = async () => {
    if (!selectedCofrinho) return;

    try {
      setIsFinalizando(true);
      await finalizarDesafio(selectedCofrinho.id as string);
      setConfirmandoFinalizacao(false);
      await carregarDados();

      // Mostrar mensagem de sucesso
      setDesafioFinalizado(true);

      // Esconder a mensagem após 5 segundos
      setTimeout(() => {
        setDesafioFinalizado(false);
      }, 5000);

      // Atualizar o cofrinho selecionado com os dados atualizados
      const cofrinhoAtualizado = cofrinhos.find(c => c.id === selectedCofrinho.id);
      if (cofrinhoAtualizado) {
        setSelectedCofrinho(cofrinhoAtualizado);
      }
    } catch (error) {
      console.error("Erro ao finalizar desafio:", error);
    } finally {
      setIsFinalizando(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
         
          <p className="text-muted-foreground">Seus cofrinhos virtuais</p>
        </div>
        <button
          onClick={() => setIsAddingCofrinho(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Novo Cofrinho
        </button>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorMessage
          message={error.message}
          linkText={error.indexUrl ? "Criar índice no Firestore" : undefined}
          linkUrl={error.indexUrl}
          onRetry={carregarDados}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {isAddingCofrinho && (
              <CofrinhoForm
                userId={id}
                cofrinho={cofrinhoParaEditar}
                onSave={handleCofrinhosUpdate}
                onCancel={() => {
                  setIsAddingCofrinho(false);
                  setCofrinhoParaEditar(null);
                }}
              />
            )}

            {selectedCofrinho ? (
              <div className="space-y-6">
                {/* Mensagem de sucesso ao finalizar desafio */}
                {desafioFinalizado && (
                  <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-md flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <p className="font-medium">Desafio finalizado com sucesso!</p>
                      <p className="text-sm">Você ganhou uma nova conquista. Continue economizando!</p>
                    </div>
                  </div>
                )}

                {/* Modal de confirmação para apagar cofrinho */}
                {confirmandoExclusao && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-bold mb-2">Confirmar exclusão</h3>
                      <p className="mb-4">
                        Tem certeza que deseja apagar o cofrinho <strong>{selectedCofrinho.nome}</strong>?
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

                {/* Modal de confirmação para finalizar desafio */}
                {confirmandoFinalizacao && selectedCofrinho.desafio && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-bold mb-2">Confirmar finalização</h3>
                      <p className="mb-4">
                        Tem certeza que deseja finalizar o desafio <strong>{selectedCofrinho.desafio.tipo}</strong> do cofrinho <strong>{selectedCofrinho.nome}</strong>?
                        O desafio será marcado como concluído e você receberá uma conquista.
                      </p>
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
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          disabled={isFinalizando}
                        >
                          {isFinalizando ? "Finalizando..." : "Finalizar"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedCofrinho(null)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar para todos os cofrinhos
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditarCofrinho(selectedCofrinho)}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors rounded-full hover:bg-blue-100/20"
                      title="Editar cofrinho"
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    {selectedCofrinho.desafio && selectedCofrinho.desafio.ativo === true && (
                      <button
                        onClick={handleConfirmarFinalizacao}
                        className="p-2 text-green-500 hover:text-green-700 transition-colors rounded-full hover:bg-green-100/20"
                        title="Finalizar desafio"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={handleConfirmarExclusao}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100/20"
                      title="Apagar cofrinho"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="mr-2">{selectedCofrinho.icone}</span>
                    {selectedCofrinho.nome}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="text-lg font-medium">R$ {selectedCofrinho.meta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Atual</p>
                      <p className="text-lg font-medium">R$ {selectedCofrinho.valorAtual.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{selectedCofrinho.progresso.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${selectedCofrinho.progresso}%` }}
                      />
                    </div>
                  </div>

                  {selectedCofrinho.desafio && selectedCofrinho.desafio.ativo === true && (
                    <div className="mb-6 bg-muted/30 p-4 rounded-lg border border-muted">
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                        Desafio
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-background/50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                          <p className="text-sm font-medium">{selectedCofrinho.desafio.tipo}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Progresso</p>
                          <p className="text-sm font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            Dia {selectedCofrinho.desafio.diaAtual} de {selectedCofrinho.desafio.duracaoDias}
                          </p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Valor hoje</p>
                          <p className="text-sm font-medium">R$ {selectedCofrinho.desafio.valorHoje.toFixed(2)}</p>
                        </div>
                        <div className="bg-background/50 p-2 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className="text-sm font-medium flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ativo
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Depósitos</h3>
                    {selectedCofrinho.depositos.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCofrinho.depositos.map((deposito) => (
                          <div key={deposito.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                            <div>
                              <p className="font-medium">R$ {deposito.valor.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {deposito.data.toLocaleDateString()} - {deposito.descricao}
                              </p>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {deposito.origemReceita ? 'Da receita' : 'Valor extra'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum depósito realizado</p>
                    )}
                  </div>
                </div>

                <ConquistasList conquistas={selectedCofrinho.conquistas} />
              </div>
            ) : (
              <CofrinhosList
                cofrinhos={cofrinhos}
                onSelectCofrinho={handleSelectCofrinho}
                onUpdate={handleCofrinhosUpdate}
                userId={id}
              />
            )}
          </div>

          <div className="space-y-6">
            <DesafiosList
              cofrinhos={cofrinhos.filter(c => c.desafio !== null && c.desafio !== undefined && c.desafio.ativo === true)}
              allCofrinhos={cofrinhos}
              onUpdate={handleCofrinhosUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
