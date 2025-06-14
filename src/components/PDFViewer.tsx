import React from 'react';

interface PDFViewerProps {
  url: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, className = '' }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!url || url.trim() === '') {
    return (
      <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Offer Document</h2>
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <div className="text-gray-400 text-4xl mb-3">📄</div>
          <p className="text-gray-600 font-medium">Document not available</p>
          <p className="text-gray-500 text-sm mt-1">
            The document will be available after processing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-3 text-gray-900">Offer Document</h2>
      
      {isLoading && (
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      )}

      {hasError && (
        <div className="bg-red-50 rounded-md p-8 text-center">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <p className="text-red-800 font-medium">Document could not be loaded</p>
          <p className="text-red-600 text-sm mt-1">
            Please check your connection or try again later
          </p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block mt-3 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Open in new tab
          </a>
        </div>
      )}

      <div className={`${isLoading || hasError ? 'hidden' : 'block'}`}>
        <iframe
          src={url}
          title="Offer PDF"
          className="w-full h-[600px] border rounded-md"
          onLoad={handleLoad}
          onError={handleError}
        />
        
        {/* Download link */}
        <div className="mt-3 text-center">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
