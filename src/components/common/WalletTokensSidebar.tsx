import React from 'react';
import { useWallet } from '../../context/WalletContext';

const WalletTokensSidebar: React.FC = () => {
  const { isWebSocketConnected } = useWallet();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Estado de Conexión</h2>
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-gray-300">
          {isWebSocketConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
    </div>
  );
};

export default WalletTokensSidebar; 