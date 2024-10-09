import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
      <style jsx>{`
        .loader {
          border-width: 6px; /* Adjust thickness */
          border-top-color: transparent; /* Makes the top part transparent */
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
