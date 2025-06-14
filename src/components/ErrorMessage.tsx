import React from 'react';
import { AlertCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  onBack,
  backLabel = 'Go Back',
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`rounded-2xl border p-6 ${getBgColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          <p className="text-gray-700 leading-relaxed">{message}</p>
          {(onRetry || onBack) && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
