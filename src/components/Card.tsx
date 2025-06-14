import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};
