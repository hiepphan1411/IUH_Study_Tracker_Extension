import React from 'react';

const LoadingPage = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
