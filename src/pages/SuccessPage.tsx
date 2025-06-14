import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PrimaryButton } from '../components/PrimaryButton';

interface SuccessPageState {
  customerName: string;
  signedAt?: string;
}

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as SuccessPageState;

  // Redirect to home if no state is provided
  if (!state || !state.customerName) {
    return <Navigate to="/offers" replace />;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">VARM</h1>
        </div>

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
            Thank you! Your offer has been signed.
          </h2>

          {/* Date */}
          <p className="text-gray-600 mb-8">
            on {formatDate(state.signedAt)}
          </p>
        </div>

        {/* Back Button */}
        <PrimaryButton onClick={() => window.location.href = '/'}>
          Back to VARM
        </PrimaryButton>
      </div>
    </div>
  );
};
