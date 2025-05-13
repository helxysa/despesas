"use client";

import { useState, useEffect } from 'react';
import {
  CategoriaCofrinho,
  TipoDesafio,
  Cofrinho
} from '../../types/types';
import { adicionarCofrinho, atualizarCofrinho } from '../../actions/actions';

interface CofrinhoFormProps {
  userId: string;
  onSave: () => void;
  onCancel: () => void;
  cofrinho?: Cofrinho | null;
}

export function CofrinhoForm({ userId, onSave, onCancel, cofrinho }: CofrinhoFormProps) {
  const [nome, setNome] = useState<string>(cofrinho?.nome || '');
  const [meta, setMeta] = useState<string>(cofrinho?.meta ? cofrinho.meta.toString() : '');
  const [categoria, setCategoria] = useState<CategoriaCofrinho>(cofrinho?.categoria || CategoriaCofrinho.OUTRO);
  const [descricao, setDescricao] = useState<string>(cofrinho?.descricao || '');
  const [icone, setIcone] = useState<string>(cofrinho?.icone || '🐷');
  const [cor, setCor] = useState<string>(cofrinho?.cor || '#FF9500');
  const temDesafioAtivo = cofrinho?.desafio && cofrinho.desafio.ativo === true;

  const [comDesafio, setComDesafio] = useState<boolean>(temDesafioAtivo || false);
  const [tipoDesafio, setTipoDesafio] = useState<TipoDesafio>(
    temDesafioAtivo && cofrinho?.desafio?.tipo ? cofrinho.desafio.tipo : TipoDesafio.DIARIO_FIXO
  );
  const [valorInicial, setValorInicial] = useState<string>(
    temDesafioAtivo && cofrinho?.desafio?.valorInicial ? cofrinho.desafio.valorInicial.toString() : ''
  );
  const [valorIncremento, setValorIncremento] = useState<string>(
    temDesafioAtivo && cofrinho?.desafio?.valorIncremento ? cofrinho.desafio.valorIncremento.toString() : ''
  );
  const [duracaoDias, setDuracaoDias] = useState<string>(
    temDesafioAtivo && cofrinho?.desafio?.duracaoDias ? cofrinho.desafio.duracaoDias.toString() : '30'
  );
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isEditing = !!cofrinho;

  const icones = ['🐷', '💰', '🏦', '💵', '🏝️', '🏠', '🚗', '📱', '💻', '👕', '✈️', '🎓', '🎁', '🎮', '📚'];
  const cores = ['#FF9500', '#FF3B30', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA', '#FFCC00'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!nome) {
      setError('Informe um nome para o cofrinho');
      return;
    }

    if (!meta || isNaN(parseFloat(meta)) || parseFloat(meta) <= 0) {
      setError('Informe uma meta válida maior que zero');
      return;
    }

    if (comDesafio) {
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
    }

    try {
      setIsSaving(true);

      const desafioConfig = comDesafio ? {
        tipo: tipoDesafio,
        valorInicial: parseFloat(valorInicial),
        valorIncremento: tipoDesafio === TipoDesafio.INCREMENTO_DIARIO ? parseFloat(valorIncremento) : 0,
        duracaoDias: parseInt(duracaoDias)
      } : undefined;

      if (isEditing && cofrinho?.id) {
        // Atualizar cofrinho existente
        await atualizarCofrinho(
          cofrinho.id,
          nome,
          parseFloat(meta),
          categoria,
          descricao,
          icone,
          cor,
          desafioConfig
        );
      } else {
        // Criar novo cofrinho
        await adicionarCofrinho(
          userId,
          nome,
          parseFloat(meta),
          categoria,
          descricao,
          icone,
          cor,
          desafioConfig
        );
      }

      onSave();
    } catch (error) {
      console.error(isEditing ? "Erro ao atualizar cofrinho:" : "Erro ao criar cofrinho:", error);
      setError(isEditing ? 'Erro ao atualizar cofrinho. Tente novamente.' : 'Erro ao criar cofrinho. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Cofrinho' : 'Novo Cofrinho'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-1">
              Nome do Cofrinho *
            </label>
            <input
              type="text"
              id="nome"
              placeholder="Ex: Viagem para a praia"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="meta" className="block text-sm font-medium mb-1">
              Meta (R$) *
            </label>
            <input
              type="number"
              id="meta"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium mb-1">
              Categoria
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaCofrinho)}
              className="w-full p-2 border rounded-md"
            >
              {Object.values(CategoriaCofrinho).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              id="descricao"
              placeholder="Descreva seu objetivo"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Ícone
          </label>
          <div className="flex flex-wrap gap-2">
            {icones.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcone(emoji)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  icone === emoji ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cor
          </label>
          <div className="flex flex-wrap gap-2">
            {cores.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setCor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  cor === color ? 'border-primary' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={comDesafio}
              onChange={(e) => setComDesafio(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              {isEditing
                ? (temDesafioAtivo
                  ? "Manter desafio de economia"
                  : "Adicionar desafio de economia")
                : "Criar com desafio de economia"}
            </span>
          </label>

          {comDesafio && (
            <div className="space-y-4 bg-muted/30 p-4 rounded-md">
              <div>
                <label htmlFor="tipoDesafio" className="block text-sm font-medium mb-1">
                  Tipo de Desafio
                </label>
                <select
                  id="tipoDesafio"
                  value={tipoDesafio}
                  onChange={(e) => setTipoDesafio(e.target.value as TipoDesafio)}
                  className="w-full p-2 border rounded-md"
                >
                  {Object.values(TipoDesafio).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valorInicial" className="block text-sm font-medium mb-1">
                    Valor Inicial (R$)
                  </label>
                  <input
                    type="number"
                    id="valorInicial"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {tipoDesafio === TipoDesafio.INCREMENTO_DIARIO && (
                  <div>
                    <label htmlFor="valorIncremento" className="block text-sm font-medium mb-1">
                      Incremento Diário (R$)
                    </label>
                    <input
                      type="number"
                      id="valorIncremento"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={valorIncremento}
                      onChange={(e) => setValorIncremento(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="duracaoDias" className="block text-sm font-medium mb-1">
                    Duração (dias)
                  </label>
                  <input
                    type="number"
                    id="duracaoDias"
                    min="1"
                    placeholder="30"
                    value={duracaoDias}
                    onChange={(e) => setDuracaoDias(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Cofrinho"}
          </button>
        </div>
      </form>
    </div>
  );
}
