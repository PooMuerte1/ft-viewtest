import React from 'react';
import Logo from '../../common/Logo/Logo';
import SearchBar from '../../common/SearchBar/SearchBar';
import NotificationSettings from '../../common/NotificationSettings/NotificationSettings';
import WalletConnect from '../../common/WalletConnect/WalletConnect';
import Footer from '../Footer';

const Header: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <header className="bg-black">
      <div className="max-w-7xl px-2 sm:max-w-7xl sm:mx-auto sm:px-6">
        {/* Top row with logo, search and wallet controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 w-full gap-4 sm:gap-0">
          {/* Logo a la izquierda */}
          <div className="flex-shrink-0 flex items-center w-full sm:w-auto justify-between sm:justify-start">
            <Logo />
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden sm:flex flex-1 justify-center px-4">
            <div className="w-full max-w-2xl">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Enter user address..."
              />
            </div>
          </div>
          
          {/* Notificaciones y Wallet a la derecha */}
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <WalletConnect />
            <NotificationSettings />
          </div>
        </div>

        {/* Search bar row - only shown on mobile */}
        <div className="sm:hidden flex justify-center items-center pb-4">
          <div className="w-full max-w-xl">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Enter user address..."
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

<Footer /> 