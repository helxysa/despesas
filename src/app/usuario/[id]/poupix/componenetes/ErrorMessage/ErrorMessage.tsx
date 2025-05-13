"use client";

interface ErrorMessageProps {
  message: string;
  linkText?: string;
  linkUrl?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, linkText, linkUrl, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-red-700 mb-2">Ocorreu um erro</h2>
      <p className="text-red-600 mb-4">{message}</p>
      
      {linkUrl && linkText && (
        <div className="mb-4">
          <a 
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {linkText}
          </a>
        </div>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
