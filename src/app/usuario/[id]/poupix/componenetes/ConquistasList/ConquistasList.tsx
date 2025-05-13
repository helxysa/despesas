"use client";

import { ConquistaCofrinho } from '../../types/types';

interface ConquistasListProps {
  conquistas: ConquistaCofrinho[];
}

export function ConquistasList({ conquistas }: ConquistasListProps) {
  if (conquistas.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Conquistas</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {conquistas.map((conquista) => (
          <div 
            key={conquista.id} 
            className="bg-muted/30 p-3 rounded-md text-center"
          >
            <div className="text-2xl mb-1">{conquista.icone}</div>
            <h3 className="font-medium text-sm">{conquista.tipo}</h3>
            <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
            <p className="text-xs mt-1">
              {conquista.data.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
