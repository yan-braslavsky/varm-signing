import React, { useState } from 'react';
import { PenTool, Check, Loader2 } from 'lucide-react';

interface SignButtonProps {
  onSign: () => Promise<void>;
  isSigned: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SignButton: React.FC<SignButtonProps> = ({
  onSign,
  isSigned,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    if (isSigned || disabled || isLoading) return;
    
    setIsClicked(true);
    try {
      await onSign();
    } finally {
      setIsClicked(false);
    }
  };

  if (isSigned) {
    return (
      <button
        disabled
        className={`w-full flex items-center justify-center px-8 py-4 bg-accent-100 text-accent-800 rounded-xl font-semibold text-lg cursor-not-allowed transition-all ${className}`}
      >
        <Check className="w-6 h-6 mr-3" />
        Already Signed
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center px-8 py-4 bg-primary-600 hover-bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all transform hover-scale-102 active-scale-98 focus-outline-none focus-ring-4 focus-ring-primary-200 ${className}`}
    >
      {isLoading || isClicked ? (
        <>
          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
          Signing...
        </>
      ) : (
        <>
          <PenTool className="w-6 h-6 mr-3" />
          Sign and Accept
        </>
      )}
    </button>
  );
};
