import React from 'react';
import { useWallet } from '../../../context/WalletContext';

const WalletConnect: React.FC = () => {
  const { isWebSocketConnected } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <div className="bg-gray-800 px-3 py-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
        <p className="text-xs text-gray-300 font-medium">
          WebSocket: <span className={isWebSocketConnected ? 'text-green-400' : 'text-yellow-400'}>
            {isWebSocketConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default WalletConnect; 