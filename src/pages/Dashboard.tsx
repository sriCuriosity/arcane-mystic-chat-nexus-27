// pages/Dashboard.tsx
import React from 'react';
import { Home, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30 shadow-2xl max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-6">
          <Home className="w-8 h-8 text-cyan-400 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Domain Selector
          </h1>
        </div>
        
        <p className="text-gray-300 mb-4">
          Welcome back, <span className="text-cyan-400 font-semibold">{currentUser?.username}</span>!
        </p>
        
        <p className="text-gray-400 text-sm mb-6">
          You have successfully accessed the neural network.
        </p>
        
        <button
          onClick={logout}
          className="flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </button>
      </div>
    </div>
  );
};