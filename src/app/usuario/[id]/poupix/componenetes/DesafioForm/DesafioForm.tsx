"use client";

import { useState, useEffect } from 'react';
import { Cofrinho, TipoDesafio } from '../../types/types';
import { atualizarCofrinho } from '../../actions/actions';

interface DesafioFormProps {
  cofrinhos: Cofrinho[];
  onSave: () => void;
  onCancel: () => void;
}

export function DesafioForm({ cofrinhos, onSave, onCancel }: DesafioFormProps) {
  // Estados para o formulário
  const [cofrinhoId, setCofrinhoId] = useState<string>('');
  const [tipoDesafio, setTipoDesafio] = useState<TipoDesafio>(TipoDesafio.DIARIO_FIXO);
  const [valorInicial, setValorInicial] = useState<string>('');
  const [valorIncremento, setValorIncremento] = useState<string>('');
  const [duracaoDias, setDuracaoDias] = useState<string>('30');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Valor exibido no input de duração (em semanas para desafio semanal)
  const duracaoExibida = tipoDesafio === TipoDesafio.SEMANAL_FIXO
    ? Math.ceil(parseInt(duracaoDias) / 7).toString()
    : duracaoDias;

  // Filtrar apenas cofrinhos sem desafios ativos
  const cofrinhosSemDesafio = cofrinhos.filter(c => !c.desafio || !c.desafio.ativo);

  // Selecionar automaticamente o primeiro cofrinho disponível
  useEffect(() => {
    if (cofrinhosSemDesafio.length > 0 && !cofrinhoId) {
      setCofrinhoId(cofrinhosSemDesafio[0].id || '');
    }
  }, [cofrinhosSemDesafio, cofrinhoId]);

  // Atualizar a duração quando o tipo de desafio mudar
  useEffect(() => {
    // Se mudar para desafio semanal, ajustar o valor para semanas
    if (tipoDesafio === TipoDesafio.SEMANAL_FIXO) {
      // Garantir que a duração seja múltiplo de 7
      const dias = parseInt(duracaoDias) || 30;
      const semanas = Math.ceil(dias / 7);
      setDuracaoDias((semanas * 7).toString());
    }
  }, [tipoDesafio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!cofrinhoId) {
      setError('Selecione um cofrinho para adicionar o desafio');
      return;
    }

    if (!valorInicial || isNaN(parseFloat(valorInicial)) || parseFloat(valorInicial) <= 0) {
      setError('Informe um valor inicial válido para o desafio');
      return;
    }

    if (tipoDesafio === TipoDesafio.INCREMENTO_DIARIO &&
        (!valorIncremento || isNaN(parseFloat(valorIncremento)) || parseFloat(valorIncremento) <= 0)) {
      setError('Informe um valor de incremento válido para o desafio');
      return;
    }

    if (!duracaoDias || isNaN(parseInt(duracaoDias)) || parseInt(duracaoDias) <= 0) {
      setError('Informe uma duração válida para o desafio');
      return;
    }

    try {
      setIsSaving(true);

      // Encontrar o cofrinho selecionado
      const cofrinhoSelecionado = cofrinhos.find(c => c.id === cofrinhoId);

      if (!cofrinhoSelecionado) {
        setError('Cofrinho não encontrado');
        return;
      }

      // Configuração do desafio
      const desafioConfig = {
        tipo: tipoDesafio,
        valorInicial: parseFloat(valorInicial),
        valorIncremento: tipoDesafio === TipoDesafio.INCREMENTO_DIARIO ? parseFloat(valorIncremento) : 0,
        duracaoDias: parseInt(duracaoDias)
      };

      // Atualizar o cofrinho com o novo desafio
      await atualizarCofrinho(
        cofrinhoId,
        cofrinhoSelecionado.nome,
        cofrinhoSelecionado.meta,
        cofrinhoSelecionado.categoria,
        cofrinhoSelecionado.descricao,
        cofrinhoSelecionado.icone,
        cofrinhoSelecionado.cor,
        desafioConfig
      );

      onSave();
    } catch (error) {
      console.error("Erro ao criar desafio:", error);
      setError('Erro ao criar desafio. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border mb-6">
      <h2 className="text-xl font-bold mb-4">Novo Desafio</h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Selecione um cofrinho
            </label>
            <select
              value={cofrinhoId}
              onChange={(e) => setCofrinhoId(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              disabled={cofrinhosSemDesafio.length === 0}
            >
              {cofrinhosSemDesafio.length === 0 ? (
                <option value="">Nenhum cofrinho disponível</option>
              ) : (
                <>
                  <option value="">Selecione um cofrinho</option>
                  {cofrinhosSemDesafio.map((cofrinho) => (
                    <option key={cofrinho.id} value={cofrinho.id}>
                      {cofrinho.nome} - R$ {cofrinho.valorAtual.toFixed(2)} / R$ {cofrinho.meta.toFixed(2)}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Desafio
            </label>
            <select
              value={tipoDesafio}
              onChange={(e) => setTipoDesafio(e.target.value as TipoDesafio)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value={TipoDesafio.DIARIO_FIXO}>Valor fixo diário</option>
              <option value={TipoDesafio.SEMANAL_FIXO}>Valor fixo semanal</option>
              <option value={TipoDesafio.INCREMENTO_DIARIO}>Valor com incremento diário</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Valor Inicial (R$)
            </label>
            <input
              type="number"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="Ex: 10.00"
              step="0.01"
              min="0.01"
            />
          </div>

          {tipoDesafio === TipoDesafio.INCREMENTO_DIARIO && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor de Incremento Diário (R$)
              </label>
              <input
                type="number"
                value={valorIncremento}
                onChange={(e) => setValorIncremento(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Ex: 1.00"
                step="0.01"
                min="0.01"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {tipoDesafio === TipoDesafio.SEMANAL_FIXO ? 'Duração (semanas)' : 'Duração (dias)'}
            </label>
            <input
              type="number"
              value={duracaoExibida}
              onChange={(e) => {
                // Se for desafio semanal, multiplicamos por 7 para converter semanas em dias
                if (tipoDesafio === TipoDesafio.SEMANAL_FIXO) {
                  const semanas = parseInt(e.target.value) || 0;
                  setDuracaoDias((semanas * 7).toString());
                } else {
                  setDuracaoDias(e.target.value);
                }
              }}
              className="w-full p-2 border rounded-md bg-background"
              placeholder={tipoDesafio === TipoDesafio.SEMANAL_FIXO ? "Ex: 4" : "Ex: 30"}
              min="1"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
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
            disabled={isSaving || cofrinhosSemDesafio.length === 0}
          >
            {isSaving ? "Salvando..." : "Criar Desafio"}
          </button>
        </div>
      </form>
    </div>
  );
}
