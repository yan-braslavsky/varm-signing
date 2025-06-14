import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  lines = 3 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-3 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
};

export const PDFSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
      <div className="aspect-[4/5] bg-gray-200 rounded-lg"></div>
    </div>
  );
};
