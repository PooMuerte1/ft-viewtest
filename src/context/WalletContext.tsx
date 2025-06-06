import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';

interface WalletContextType {
  isWebSocketConnected: boolean;
  socket: Socket | null;
  isConnected: boolean;
  walletAddress: string | null;
  rugfiBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [rugfiBalance, setRugfiBalance] = useState('0');
  const reconnectAttempts = useRef(0);
  const { showToast } = useToast();

  // Conectar WebSocket al cargar la aplicación
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= 3) {
      showToast({ type: 'error', message: 'Maximum reconnection attempts reached' });
      return;
    }

    try {
      const socketInstance = io(import.meta.env.VITE_WEBSOCKET_URL, {
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        timeout: 10000,
      });

      socketInstance.on('connect', () => {
        setIsWebSocketConnected(true);
        reconnectAttempts.current = 0;
        showToast({ type: 'success', message: 'Socket.IO connected' });
        console.log('Connected to server:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        setIsWebSocketConnected(false);
        reconnectAttempts.current += 1;
        
        if (reconnectAttempts.current < 3) {
          showToast({ type: 'error', message: `Socket.IO disconnected. Attempt ${reconnectAttempts.current} of 3` });
        } else {
          showToast({ type: 'error', message: 'Maximum reconnection attempts reached' });
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        showToast({ type: 'error', message: 'Connection error occurred' });
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
      showToast({ type: 'error', message: 'Failed to connect to server' });
    }
  }, [showToast]);

  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsWebSocketConnected(false);
      reconnectAttempts.current = 0;
    }
  }, [socket]);

  const connectWallet = async () => {
    try {
      // Implementación de conexión de wallet
      setIsConnected(true);
      setWalletAddress('wallet_address_here');
      setRugfiBalance('0');
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setRugfiBalance('0');
  };

  return (
    <WalletContext.Provider value={{ isWebSocketConnected, socket, isConnected, walletAddress, rugfiBalance, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 
