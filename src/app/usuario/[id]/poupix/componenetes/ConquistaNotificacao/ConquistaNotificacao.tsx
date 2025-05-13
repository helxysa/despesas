"use client";

import { useState, useEffect } from 'react';
import { ConquistaCofrinho, TipoConquista } from '../../types/types';
import { Trophy, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import { marcarConquistaMostrada, marcarNotificacaoNaSessao } from '../../utils/notificacoes';

// Importar react-confetti de forma dinâmica para evitar problemas de SSR
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface ConquistaNotificacaoProps {
  conquista: ConquistaCofrinho;
  onClose: () => void;
}

export function ConquistaNotificacao({ conquista, onClose }: ConquistaNotificacaoProps) {
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

    // Fechar automaticamente após 8 segundos
    const timer = setTimeout(() => {
      // Marcar a conquista como já mostrada antes de fechar
      if (conquista && conquista.id) {
        marcarConquistaMostrada(conquista);
        // Marcar que já mostramos esta notificação nesta sessão
        marcarNotificacaoNaSessao(conquista.id);
      }
      onClose();
    }, 8000);

    // Parar o confete após 3 segundos
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [onClose, conquista]);

  // Determinar o ícone e a variante com base no tipo de conquista
  let icone = conquista.icone;
  let variant = "default";

  if (conquista.tipo === TipoConquista.DESAFIO_COMPLETO || conquista.tipo === TipoConquista.META_PERCENTUAL) {
    variant = "success";
  }

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
      <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-slide-up">
        <Alert variant={variant as any} className="pr-8">
          <Trophy className="h-4 w-4" />
          <AlertTitle className="flex items-center">
            <span className="mr-2">{icone}</span> Nova Conquista!
          </AlertTitle>
          <AlertDescription>
            <p className="font-medium">{conquista.tipo}</p>
            <p>{conquista.descricao}</p>
            <p className="text-xs mt-1 opacity-70">
              {conquista.data.toLocaleDateString()}
            </p>
          </AlertDescription>
          <button
            onClick={() => {
              // Marcar a conquista como já mostrada ao fechar manualmente
              if (conquista && conquista.id) {
                marcarConquistaMostrada(conquista);
                // Marcar que já mostramos esta notificação nesta sessão
                marcarNotificacaoNaSessao(conquista.id);
              }
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      </div>
    </>
  );
}
