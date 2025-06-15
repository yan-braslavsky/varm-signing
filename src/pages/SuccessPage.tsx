import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/PrimaryButton';

interface SuccessPageState {
  customerName: string;
  signedAt?: string;
  offerSlug?: string;
}

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SuccessPageState;

  // Redirect to home if no state is provided or if accessing directly without proper navigation
  if (!state || !state.customerName || !state.signedAt) {
    return <Navigate to="/offers" replace />;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white px-3 sm:px-6 py-6">
      <div className="max-w-md mx-auto">
        {/* Success Content */}
        <div className="text-center mb-8">
          {/* Checkmark Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vielen Dank! Ihr Angebot wurde unterzeichnet.
          </h2>

          {/* Date */}
          <p className="text-gray-600 mb-8">
            am {formatDate(state.signedAt)}
          </p>
        </div>

        {/* Back Button */}
        <PrimaryButton onClick={() => {
          if (state.offerSlug) {
            navigate(`/sign/${state.offerSlug}`);
          } else {
            navigate('/offers');
          }
        }}>
          {state.offerSlug ? 'Zurück zum Angebot' : 'Zurück zu Angeboten'}
        </PrimaryButton>
      </div>
    </div>
  );
};
