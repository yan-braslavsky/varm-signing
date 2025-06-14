import React, { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, Calendar } from 'lucide-react';

interface SuccessMessageProps {
  customerName: string;
  signedAt?: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  customerName,
  signedAt,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(dateString));
  };

  const handleVisitVarm = () => {
    window.open('https://varm.energy', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Success Animation */}
      <div
        className={`transition-all duration-700 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <div className="relative inline-block mb-8">
          <CheckCircle className="w-24 h-24 text-accent-600 animate-bounce-in" />
          <div className="absolute inset-0 w-24 h-24 bg-accent-600 rounded-full opacity-20 animate-ping" />
        </div>
      </div>

      {/* Success Message */}
      <div
        className={`transition-all duration-700 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank you, {customerName}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your offer has been successfully signed and accepted.
        </p>
      </div>

      {/* Timestamp */}
      {signedAt && (
        <div
          className={`transition-all duration-700 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-xl mb-8">
            <Calendar className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">
              Signed on {formatDate(signedAt)}
            </span>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div
        className={`transition-all duration-700 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            What's Next?
          </h2>
          <p className="text-gray-600 mb-6">
            We'll be in touch soon with next steps. In the meantime, learn more about VARM's climate solutions.
          </p>
          <button
            onClick={handleVisitVarm}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200"
          >
            Visit VARM
            <ExternalLink className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
