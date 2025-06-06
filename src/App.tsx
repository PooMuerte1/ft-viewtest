import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SoundNotificationProvider } from './context/SoundNotificationContext';
import { WalletProvider } from './context/WalletContext';
import { TradingProvider } from './context/TradingContext';
import Home from './pages/Home/Home';
import BuyRugFiButton from './components/common/BuyRugFiButton';
import Footer from './components/layout/Footer/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <WalletProvider>
          <TradingProvider>
            <SoundNotificationProvider>
              <div className="bg-zinc-800 flex flex-col h-screen">
                <div className="h-full flex-1">
                  <Home />
                </div>
                <BuyRugFiButton />
                <Footer />
              </div>
           
            </SoundNotificationProvider>
          </TradingProvider>
        </WalletProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
