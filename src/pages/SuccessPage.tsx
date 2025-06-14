import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { SuccessMessage } from '../components/SuccessMessage';

interface SuccessPageState {
  customerName: string;
  signedAt?: string;
}

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as SuccessPageState;

  // Redirect to home if no state is provided
  if (!state || !state.customerName) {
    return <Navigate to="/sign/test-offer-123" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <SuccessMessage
          customerName={state.customerName}
          signedAt={state.signedAt}
          className="animate-fade-in"
        />
      </div>
    </div>
  );
};
