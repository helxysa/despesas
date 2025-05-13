"use client";

import { PiggyBank } from "lucide-react";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [dots, setDots] = useState("");

  // Animação dos pontos de carregamento
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-60 space-y-4">
      <div className="relative">
        <PiggyBank className="h-16 w-16 text-green-500 animate-bounce" />
        <div className="absolute -top-2 -right-2 h-4 w-4 bg-primary rounded-full animate-ping" />
      </div>

      <div className="flex flex-col items-center">
        <p className="text-lg font-medium">Carregando cofrinhos{dots}</p>
        <p className="text-sm text-muted-foreground mt-1">Preparando seus cofrinhos virtuais</p>
      </div>

      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-primary animate-pulse"
          style={{
            animation: "loadingProgress 2s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes loadingProgress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
