import React from 'react';
import { processPdfUrl } from '../utils/firebaseStorage';

interface PDFViewerProps {
  url: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, className = '' }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Process the URL to handle Firebase Storage gs:// URLs
  const processedUrl = React.useMemo(() => processPdfUrl(url), [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!processedUrl || processedUrl.trim() === '') {
    return (
      <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Angebotsdokument</h2>
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <div className="text-gray-400 text-4xl mb-3">📄</div>
          <p className="text-gray-600 font-medium">Dokument nicht verfügbar</p>
          <p className="text-gray-500 text-sm mt-1">
            Das Dokument wird nach der Verarbeitung verfügbar sein
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-3 text-gray-900">Angebotsdokument</h2>
      
      {isLoading && (
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Dokument wird geladen...</p>
        </div>
      )}

      {hasError && (
        <div className="bg-red-50 rounded-md p-8 text-center">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <p className="text-red-800 font-medium">Dokument konnte nicht geladen werden</p>
          <p className="text-red-600 text-sm mt-1">
            Bitte überprüfen Sie Ihre Verbindung oder versuchen Sie es später erneut
          </p>
          <a 
            href={processedUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block mt-3 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            In neuem Tab öffnen
          </a>
        </div>
      )}

      <div className={`${isLoading || hasError ? 'hidden' : 'block'}`}>
        <iframe
          src={processedUrl}
          title="Angebots-PDF"
          className="w-full h-[600px] border rounded-md"
          onLoad={handleLoad}
          onError={handleError}
        />
        
        {/* Download link */}
        <div className="mt-3 text-center">
          <a 
            href={processedUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            PDF herunterladen
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
