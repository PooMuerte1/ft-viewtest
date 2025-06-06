import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';

const getRouteScanUrl = (address: string) =>
  `${import.meta.env.VITE_ROUTESCAN_API_URL}/address/${address}/erc20-holdings?ecosystem=avalanche&limit=100`;

// Función para generar un color basado en el string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
};

// Función para obtener las iniciales del token
const getTokenInitials = (symbol: string) => {
  if (!symbol) return '?';
  return symbol.slice(0, 2).toUpperCase();
};

// Componente para el fallback del icono
const TokenIconFallback: React.FC<{ symbol: string }> = ({ symbol }) => {
  const backgroundColor = stringToColor(symbol);
  const initials = getTokenInitials(symbol);

  return (
    <div 
      className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
};

function formatBalance(balance: string, decimals: number) {
  if (!balance) return '0';
  return (Number(balance) / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const WalletTokensSidebar: React.FC = () => {
  const { walletAddress, isConnected } = useWallet();
  const [tokens, setTokens] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchTokens = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getRouteScanUrl(walletAddress));
      if (!res.ok) throw new Error('Failed to fetch tokens');
      const data = await res.json();
      setTokens(data.items || []);
    } catch (err: any) {
      setError('Error fetching tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchTokens();
    } else {
      setTokens([]);
    }
    // eslint-disable-next-line
  }, [walletAddress, isConnected]);

  const filteredTokens = tokens.filter(token =>
    (token.token.symbol && token.token.symbol.toLowerCase().includes(search.toLowerCase())) ||
    (token.token.name && token.token.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleImageError = (tokenAddress: string) => {
    setFailedImages(prev => new Set([...prev, tokenAddress]));
  };

  return (
    <div className="relative bg-black border border-gray-800 rounded-lg shadow-md w-full">
      {/* Header - Always visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-800/50 transition-colors flex items-center justify-between z-10 relative bg-black rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-bold text-white">Your Wallet Tokens</h2>
          {isConnected && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400">
              {tokens.length} tokens
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors text-red-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                fetchTokens();
              }}
              title="Refresh"
              disabled={loading}
            >
              <svg
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.657-3.032M20 15a8 8 0 01-13.657 3.032"
                />
              </svg>
            </button>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable Content - Now positioned absolutely */}
      <div 
        className={`absolute left-0 right-0 z-20 transition-all duration-200 ease-in-out ${
          isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          top: '100%',
          marginTop: '0.25rem'
        }}
      >
        <div className="bg-black border border-gray-800 rounded-lg shadow-lg">
          <div className="p-3">
            {/* Search Bar */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search token..."
                className="w-full px-3 py-2 rounded bg-black text-white border border-gray-700 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
            </div>

            {/* Token List */}
            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px' }}>
              {!isConnected ? (
                <div className="text-gray-400 text-center py-6 text-sm">
                  Connect your wallet to see your tokens.
                </div>
              ) : loading ? (
                <div className="text-gray-400 text-center py-6 text-sm">
                  Loading...
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTokens.length === 0 ? (
                    <div className="text-gray-500 text-center py-4 text-sm">
                      No tokens found.
                    </div>
                  ) : (
                    filteredTokens.map(token => (
                      <div 
                        key={token.tokenAddress} 
                        className="flex items-center p-2 rounded hover:bg-gray-800/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Token Icon */}
                        <div className="flex-shrink-0 mr-2">
                          {(!token.token.detail?.icon && !token.token.detail?.iconUrls?.['32']) || failedImages.has(token.tokenAddress) ? (
                            <TokenIconFallback symbol={token.token.symbol} />
                          ) : (
                            <img 
                              src={token.token.detail?.icon || token.token.detail?.iconUrls?.['32']} 
                              alt={token.token.symbol} 
                              className="w-6 h-6 rounded-full border border-gray-700"
                              onError={() => handleImageError(token.tokenAddress)}
                            />
                          )}
                        </div>

                        {/* Token Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 truncate">
                              <div className="text-white font-semibold text-sm truncate">
                                {token.token.symbol}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {token.token.name}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-white text-sm whitespace-nowrap">
                                {formatBalance(token.holderBalance, token.token.decimals)}
                              </div>
                              {token.valueInUsd && (
                                <div className="text-xs text-green-400 whitespace-nowrap">
                                  ${Number(token.valueInUsd).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTokensSidebar; 