import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useWallet } from '../../../context/WalletContext';
import { useSoundNotification } from '../../../context/SoundNotificationContext';

import SearchAnalysisModal from '../SearchAnalysisModal/SearchAnalysisModal';

interface Token {
  tokenId?: string | number;
  tokenSupply: string;
  creatorAddress: string;
  tokenContractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  params?: {
    curveScaler: string;
    a: string;
    b: string;
    lpDeployed: boolean;
    lpPercentage: string;
    salePercentage: string;
    creatorFeeBasisPoints: string;
    pairAddress: string;
  };
  createdAt: string;
  analysis?: {
    totalRugs: number;
  };
  risky?: 'safe' | 'risky' | 'pending';
  bonding_percent?: number;
  sniped?: boolean;
  creatorInfo?: {
    twitter_handle: string;
    twitter_followers: number;
    twitter_pfp_url: string;
    twitter_username?: string;
    wallet_balance?: number;
    join_time?: number;
    last_updated?: number;
  };
}

interface ArenaToken {
  token_contract_address: string;
  creator_address: string;
  create_time: number;
  token_name: string;
  token_symbol: string;
  creator_twitter_handle: string;
  creator_twitter_followers: number;
  photo_url: string;
  group_id: number;
}

// Utility function to format address
const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Dropdown animation styles
const dropdownAnimationStyles = `
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
      visibility: hidden;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }
  }
  .dropdown-menu {
    visibility: hidden;
    opacity: 0;
    transform: translateY(-10px);
  }
  .dropdown-menu.open {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.2s ease-out;
  }
`;

// Inject dropdown animation styles
const dropdownStyle = document.createElement('style');
dropdownStyle.textContent = dropdownAnimationStyles;
document.head.appendChild(dropdownStyle);

const CreatorActions: React.FC<{
  creatorAddress: string;
  onAnalyze: (address: string) => void;
}> = ({ creatorAddress, onAnalyze }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { showToast } = useToast();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(creatorAddress);
      showToast({ type: 'success', message: 'Address copied to clipboard' });
      setIsOpen(false);
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to copy address' });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleAnalyze = () => {
    onAnalyze(creatorAddress);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 text-xs hover:bg-gray-800 cursor-pointer bg-gray-900 p-2 rounded-lg flex items-center gap-1 transition-colors duration-200"
      >
        {formatAddress(creatorAddress)}
      </button>
      <div
        ref={menuRef}
        className={`absolute z-50 bottom-10 md:-bottom-44 w-48 md:mt-1 bg-gray-900 rounded-lg shadow-lg py-1 dropdown-menu ${
          isOpen ? 'open' : ''
        }`}
      >
        <button
          onClick={copyToClipboard}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy Address
        </button>

        <button
          onClick={() => openInNewTab(`https://arenabook.xyz/user/${creatorAddress}`)}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View on ArenaBook
        </button>

        <button
          onClick={() => openInNewTab(`https://snowtrace.io/address/${creatorAddress}`)}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View on Snowtrace
        </button>

        <div className="border-t border-gray-700 my-1"></div>

        <button
          onClick={handleAnalyze}
          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          Analyze User
        </button>
      </div>
    </div>
  );
};

const ContractActions: React.FC<{
  contractAddress: string;
}> = ({ contractAddress }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { showToast } = useToast();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      showToast({ type: 'success', message: 'Contract address copied to clipboard' });
      setIsOpen(false);
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to copy address' });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 text-xs hover:bg-gray-800 cursor-pointer bg-gray-900 p-2 rounded-lg flex items-center gap-1 transition-colors duration-200"
      >
        {formatAddress(contractAddress)}
      </button>
      <div
        ref={menuRef}
        className={`absolute bottom-10 md:-bottom-44 z-50 w-48 bg-gray-900 rounded-lg shadow-lg py-1 dropdown-menu ${
          isOpen ? 'open' : ''
        }`}
      >
        <button
          onClick={copyToClipboard}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy Contract Address
        </button>

        <button
          onClick={() => openInNewTab(`https://arenabook.xyz/token/${contractAddress}`)}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View on ArenaBook
        </button>

        <button
          onClick={() => openInNewTab(`https://snowtrace.io/address/${contractAddress}`)}
          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View on Snowtrace
        </button>

        <div className="border-t border-gray-700 my-1"></div>

        <button
          onClick={() => openInNewTab(`https://snowtrace.io/token/${contractAddress}`)}
          className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-800 flex items-center gap-2 transition-colors duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          View Token Info
        </button>
      </div>
    </div>
  );
};

const TokenCard: React.FC<{
  token: Token;
  onTrade: (token: Token) => void;
  onAnalyzeCreator: (address: string) => void;
  isConnected: boolean;
  getRiskBadgeClass: (risky: string) => string;
  getBondingBadgeClass: (percent?: number) => string;
  getSnipedBadgeClass: (sniped?: boolean) => string;
  formatDate: (dateString: string) => string;
}> = ({
  token,
  onTrade,
  onAnalyzeCreator,
  isConnected,
  getRiskBadgeClass,
  getBondingBadgeClass,
  getSnipedBadgeClass,
  formatDate,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-black border border-gray-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-3 cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-col">
              <a
                href={'https://arenabook.xyz/token/' + token.tokenContractAddress}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:text-red-600"
                onClick={e => e.stopPropagation()}
              >
                {token.tokenName}
              </a>
              <span className="text-xs text-gray-400 mt-0.5">{token.tokenSymbol}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-xs">{formatDate(token.createdAt)}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className={`inline-block px-2 py-0.5 text-xs rounded ${getRiskBadgeClass(token.risky || 'pending')}`}>
              {token.risky === 'pending' ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-3 w-3 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : token.analysis ? (
                token.risky === 'safe'
                  ? 'Safe'
                  : `Potential rug${token.analysis.totalRugs > 1 ? ` (${token.analysis.totalRugs})` : ''}`
              ) : (
                'Pending'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-3 space-y-3 border-t border-gray-800">
          {/* Twitter info */}
          <div className="flex items-center space-x-2">
            {token.creatorInfo ? (
              <>
                <img
                  src={token.creatorInfo.twitter_pfp_url}
                  alt="Twitter profile"
                  className="w-8 h-8 rounded-full"
                  onError={e => {
                    e.currentTarget.src =
                      'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
                  }}
                />
                <div className="flex flex-col">
                  <a
                    href={`https://twitter.com/${token.creatorInfo.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    @{token.creatorInfo.twitter_handle}
                  </a>
                  <span className="text-gray-400 text-xs">
                    {(token.creatorInfo?.twitter_followers ?? 0).toLocaleString()} followers
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <img
                  src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                  alt="Default profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">No Twitter info</span>
                  <span className="text-gray-500 text-xs">0 followers</span>
                </div>
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">BONDING</span>
              <span className={`inline-block px-2 py-1 text-xs rounded ${getBondingBadgeClass(token.bonding_percent)}`}>
                {token.bonding_percent === undefined ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  `${token.bonding_percent.toFixed(2)}%`
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 mb-1">SNIPED</span>
              <span className={`inline-block px-2 py-1 text-xs rounded ${getSnipedBadgeClass(token.sniped)}`}>
                {token.sniped === undefined ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : token.sniped ? (
                  'Yes'
                ) : (
                  'No'
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <CreatorActions creatorAddress={token.creatorAddress} onAnalyze={onAnalyzeCreator} />
              <ContractActions contractAddress={token.tokenContractAddress} />
            </div>
            <button
              onClick={() => onTrade(token)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
              disabled={!isConnected}
              title={!isConnected ? 'Connect wallet to trade' : 'Trade token'}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MAX_TOKENS = 20;

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const { showToast } = useToast();
  const { isWebSocketConnected, socket } = useWallet();
  const { playNotificationSound, settings } = useSoundNotification();
  const [selectedCreator, setSelectedCreator] = React.useState<string | null>(null);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);

  // Memoize utility functions
  const getRiskBadgeClass = useCallback((risky: string) => {
    if (risky === 'pending') return 'bg-yellow-900 text-yellow-400';
    if (risky === 'safe') return 'bg-green-900 text-green-400';
    return 'bg-red-900 text-red-400';
  }, []);

  const getBondingBadgeClass = useCallback((percent?: number) => {
    if (percent === undefined) return 'bg-gray-800 text-gray-400';
    if (percent >= 10) return 'bg-green-900 text-green-400';
    if (percent >= 5) return 'bg-yellow-900 text-yellow-400';
    return 'bg-red-900 text-red-400';
  }, []);

  const getSnipedBadgeClass = useCallback((sniped?: boolean) => {
    if (sniped === undefined) return 'bg-gray-800 text-gray-400';
    return sniped ? 'bg-purple-900 text-purple-400' : 'bg-gray-800 text-gray-400';
  }, []);

  const formatDate = useCallback((dateString: string) => new Date(dateString).toLocaleString(), []);

  // Optimized token update function
  const updateTokens = useCallback((newToken: Token) => {
    setTokens(prevTokens => {
      const existingTokenIndex = prevTokens.findIndex(t => t.tokenContractAddress === newToken.tokenContractAddress);
      
      if (existingTokenIndex !== -1) {
        const updatedTokens = [...prevTokens];
        updatedTokens[existingTokenIndex] = { ...updatedTokens[existingTokenIndex], ...newToken };
        return updatedTokens;
      } else {
        const updatedTokens = [newToken, ...prevTokens];
        if (updatedTokens.length > MAX_TOKENS) {
          return updatedTokens.slice(0, MAX_TOKENS);
        }
        return updatedTokens;
      }
    });
  }, []);

  // Modificar updateTokenData para incluir timestamp
  const updateTokenData = useCallback((tokenAddress: string, updates: Partial<Token>) => {
    setTokens(prevTokens =>
      prevTokens.map(token =>
        token.tokenContractAddress === tokenAddress
          ? { ...token, ...updates }
          : token
      )
    );
  }, []);

  // Memoize fetch functions
  const fetchWithRetry = useCallback(async (url: string, maxRetries = 3): Promise<any> => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) throw lastError;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw lastError;
  }, []);

  const fetchTokenAnalysis = useCallback(async (creatorAddress: string) => {
    try {
      const data = await fetchWithRetry(
        `${import.meta.env.VITE_API_BASE_URL}/token/rug-verifier/${creatorAddress}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching token analysis:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const fetchTokenBonding = useCallback(async (tokenContractAddress: string) => {
    try {
      const data = await fetchWithRetry(
        `${import.meta.env.VITE_API_BASE_URL}/token/bonding/${tokenContractAddress.toLowerCase()}`
      );
      return data.data;
    } catch (error) {
      console.error('Error fetching token bonding:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const fetchCreatorInfo = async (creatorAddress: string) => {
    try {
      if (!creatorAddress) {
        console.error('Creator address is undefined or empty');
        return null;
      }
      const lowerAddress = creatorAddress.toLowerCase();
      const url = `${import.meta.env.VITE_API_BASE_URL}/arena/user/${lowerAddress}`;
      const response = await fetchWithRetry(url);
      if (!response.success || !response.data || response.data.length === 0) {
        console.error('No creator info found');
        return null;
      }
      const creatorData = response.data[0];
      return {
        twitter_handle: creatorData.twitter_handle,
        twitter_followers: creatorData.twitter_followers,
        twitter_pfp_url: creatorData.twitter_pfp_url,
        twitter_username: creatorData.twitter_username,
        wallet_balance: creatorData.wallet_balance,
        join_time: creatorData.join_time,
        last_updated: creatorData.last_updated,
      };
    } catch (error) {
      console.error('Error fetching creator info:', error);
      return null;
    }
  };

  const fetchInitialTokens = async () => {
    try {
      const arenaResponse = await fetchWithRetry(
        `${import.meta.env.VITE_ARENA_API_URL}/groups_plus?is_official=eq.false&limit=5&offset=0&order=create_time.desc.nullslast&select=token_contract_address,creator_address,create_time,token_name,token_symbol,creator_twitter_handle,creator_twitter_followers,token_name,photo_url,group_id`
      );
      const arenaTokens: ArenaToken[] = arenaResponse;
      const processedTokens = await Promise.all(
        arenaTokens.map(async arenaToken => {
          try {
            const [analysis, bonding] = await Promise.all([
              fetchTokenAnalysis(arenaToken.creator_address),
              fetchTokenBonding(arenaToken.token_contract_address),
            ]);
            return {
              tokenId: arenaToken.group_id,
              tokenSupply: '10000000000000000000000000000',
              creatorAddress: arenaToken.creator_address,
              tokenContractAddress: arenaToken.token_contract_address,
              tokenName: arenaToken.token_name,
              tokenSymbol: arenaToken.token_symbol,
              createdAt: new Date(arenaToken.create_time * 1000).toISOString(),
              analysis,
              risky: analysis?.totalRugs > 0 ? 'risky' : 'safe',
              bonding_percent: bonding.bonding_percent,
              sniped: bonding.sniped,
              creatorInfo: {
                twitter_handle: arenaToken.creator_twitter_handle,
                twitter_followers: arenaToken.creator_twitter_followers,
                twitter_pfp_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
                twitter_username: undefined,
                wallet_balance: undefined,
                join_time: undefined,
                last_updated: undefined,
              },
            } as Token;
          } catch (error) {
            console.error('Error processing token:', arenaToken.token_contract_address, error);
            return {
              tokenId: undefined,
              tokenSupply: '10000000000000000000000000000',
              creatorAddress: arenaToken.creator_address,
              tokenContractAddress: arenaToken.token_contract_address,
              tokenName: arenaToken.token_name,
              tokenSymbol: arenaToken.token_symbol,
              createdAt: new Date(arenaToken.create_time * 1000).toISOString(),
              risky: 'pending' as const,
              creatorInfo: {
                twitter_handle: arenaToken.creator_twitter_handle,
                twitter_followers: arenaToken.creator_twitter_followers,
                twitter_pfp_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
                twitter_username: undefined,
                wallet_balance: undefined,
                join_time: undefined,
                last_updated: undefined,
              },
            } as Token;
          }
        })
      );
      setTokens(processedTokens);
    } catch (error) {
      console.error('Error fetching initial tokens:', error);
      showToast({ type: 'error', message: 'Error loading tokens' });
    }
  };

  // Función para actualizar el bonding de los tokens recientes
  const updateRecentTokensBonding = useCallback(async () => {
    if (recentTokens.length === 0) return;

    try {
      const bondingPromises = recentTokens.map(tokenAddress => 
        fetchTokenBonding(tokenAddress)
          .then(bonding => {
            updateTokenData(tokenAddress, {
              bonding_percent: bonding.bonding_percent,
              sniped: bonding.sniped,
            });
          })
          .catch(error => {
            console.error(`Error fetching bonding for ${tokenAddress}:`, error);
          })
      );

      await Promise.all(bondingPromises);
    } catch (error) {
      console.error('Error updating recent tokens bonding:', error);
    }
  }, [recentTokens, fetchTokenBonding, updateTokenData]);

  // Efecto para el polling de bonding
  useEffect(() => {
    if (recentTokens.length === 0) return;

    const intervalId = setInterval(updateRecentTokensBonding, 5000);
    return () => clearInterval(intervalId);
  }, [recentTokens, updateRecentTokensBonding]);

  // Fetch initial tokens when socket is ready
  useEffect(() => {
    if (isWebSocketConnected) {
      fetchInitialTokens();
    }
  }, [isWebSocketConnected]);

  // Listen websocket newToken events and handle token updates
  useEffect(() => {
    if (!isWebSocketConnected || !socket) return;

    const handleNewToken = (tokenData: Token) => {
      setRecentTokens(prev => {
        const newList = [tokenData.tokenContractAddress, ...prev].slice(0, 5);
        return newList;
      });

      const newToken: Token = {
        ...tokenData,
        risky: 'pending',
        bonding_percent: undefined,
        sniped: undefined,
        creatorInfo: undefined,
      };

      updateTokens(newToken);

      if (settings.safeTokens && settings.rugTokens) {
        playNotificationSound();
      }

      fetchTokenAnalysis(tokenData.creatorAddress)
        .then(analysis => {
          const isTokenSafe = analysis?.totalRugs === 0;
          const newState = isTokenSafe ? 'safe' : 'risky';
          
          updateTokenData(tokenData.tokenContractAddress, {
            analysis,
            risky: newState
          });

          const shouldNotify =
            (newState === 'safe' && settings.safeTokens) ||
            (newState === 'risky' && settings.rugTokens);

          if (shouldNotify) {
            playNotificationSound();
          }
        })
        .catch(error => {
          console.error('Error fetching token analysis:', error);
          showToast({ type: 'error', message: 'Error analyzing token' });
        });

      fetchTokenBonding(tokenData.tokenContractAddress)
        .then(bonding => {
          updateTokenData(tokenData.tokenContractAddress, {
            bonding_percent: bonding.bonding_percent,
            sniped: bonding.sniped,
          });
        })
        .catch(error => {
          console.error('Error fetching token bonding:', error);
          showToast({ type: 'error', message: 'Error fetching bonding info' });
        });

      fetchCreatorInfo(tokenData.creatorAddress)
        .then(creatorInfo => {
          if (creatorInfo) {
            updateTokenData(tokenData.tokenContractAddress, {
              creatorInfo: {
                twitter_handle: creatorInfo.twitter_handle,
                twitter_followers: creatorInfo.twitter_followers,
                twitter_pfp_url: creatorInfo.twitter_pfp_url,
                twitter_username: creatorInfo.twitter_username,
                wallet_balance: creatorInfo.wallet_balance,
                join_time: creatorInfo.join_time,
                last_updated: creatorInfo.last_updated,
              },
            });
          }
        })
        .catch(error => {
          console.error('Error fetching creator info:', error);
        });
    };

    socket.on('newToken', handleNewToken);

    return () => {
      socket.off('newToken', handleNewToken);
    };
  }, [isWebSocketConnected, socket, updateTokens, updateTokenData, fetchTokenAnalysis, fetchTokenBonding, fetchCreatorInfo, settings, playNotificationSound, showToast]);

  // Memoize the token list rendering
  const memoizedTokens = useMemo(() => tokens, [tokens]);

  return (
    <div className="h-screen flex items-start justify-center pt-8">
      {/* Token list */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-black rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">{isWebSocketConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Scroll container */}
          <div className="flex-1 overflow-y-scroll custom-scrollbar">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">DATE</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">TOKEN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CREATOR</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">CONTRACT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">X</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">RISKY</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">BONDING</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">SNIPED</th>
                  </tr>
                </thead>
                <tbody className="bg-black">
                  {memoizedTokens.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        Waiting for token activity...
                      </td>
                    </tr>
                  ) : (
                    memoizedTokens.map(token => (
                      <tr
                        key={token.tokenContractAddress}
                        className="hover:bg-gray-900 transition-colors duration-100"
                      >
                        {/* DATE */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-gray-300 text-xs">{formatDate(token.createdAt)}</span>
                        </td>
                        {/* TOKEN */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col">
                              <a
                                href={'https://arenabook.xyz/token/' + token.tokenContractAddress}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-semibold hover:text-red-600 cursor-pointer"
                              >
                                {token.tokenName}
                              </a>
                              <span className="text-xs text-gray-400">{token.tokenSymbol}</span>
                            </div>
                          </div>
                        </td>
                        {/* CREATOR */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <CreatorActions
                            creatorAddress={token.creatorAddress}
                            onAnalyze={address => setSelectedCreator(address)}
                          />
                        </td>
                        {/* CONTRACT */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ContractActions contractAddress={token.tokenContractAddress} />
                        </td>
                        {/* X column */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {token.creatorInfo ? (
                            <div className="flex items-center space-x-2">
                              <img
                                src={token.creatorInfo.twitter_pfp_url}
                                alt="Twitter profile"
                                className="w-6 h-6 rounded-full"
                                onError={e => {
                                  e.currentTarget.src =
                                    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
                                }}
                              />
                              <div className="flex flex-col">
                                <a
                                  href={`https://twitter.com/${token.creatorInfo.twitter_handle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-xs"
                                >
                                  @{token.creatorInfo.twitter_handle}
                                </a>
                                <span className="text-gray-400 text-xs">
                                  {(token.creatorInfo?.twitter_followers ?? 0).toLocaleString()} followers
                                </span>
                              </div>
                            </div>
                          ) : token.risky === 'pending' ? (
                            <div className="flex items-center justify-center">
                              <svg
                                className="animate-spin h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <img
                                src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
                                alt="Default profile"
                                className="w-6 h-6 rounded-full"
                              />
                              <div className="flex flex-col">
                                <span className="text-gray-400 text-xs">No Twitter info</span>
                                <span className="text-gray-500 text-xs">0 followers</span>
                              </div>
                            </div>
                          )}
                        </td>
                        {/* RISKY */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getRiskBadgeClass(token.risky || 'pending')}`}>
                            {token.risky === 'pending' ? (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 text-yellow-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : token.analysis ? (
                              token.risky === 'safe'
                                ? 'Safe'
                                : `Potential rug${token.analysis.totalRugs > 1 ? ` (${token.analysis.totalRugs})` : ''}`
                            ) : (
                              'Pending'
                            )}
                          </span>
                        </td>
                        {/* BONDING */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getBondingBadgeClass(token.bonding_percent)}`}>
                            {token.bonding_percent === undefined ? (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              `${token.bonding_percent.toFixed(2)}%`
                            )}
                          </span>
                        </td>
                        {/* SNIPED */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getSnipedBadgeClass(token.sniped)}`}>
                            {token.sniped === undefined ? (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : token.sniped ? (
                              'Yes'
                            ) : (
                              'No'
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-3">
              {memoizedTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Waiting for token activity...</div>
              ) : (
                memoizedTokens.map(token => (
                  <TokenCard
                    key={token.tokenContractAddress}
                    token={token}
                    onTrade={() => {}}
                    onAnalyzeCreator={setSelectedCreator}
                    isConnected={false}
                    getRiskBadgeClass={getRiskBadgeClass}
                    getBondingBadgeClass={getBondingBadgeClass}
                    getSnipedBadgeClass={getSnipedBadgeClass}
                    formatDate={formatDate}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedCreator && (
        <SearchAnalysisModal
          isOpen={!!selectedCreator}
          onClose={() => setSelectedCreator(null)}
          userAddress={selectedCreator}
        />
      )}
    </div>
  );
};

export default TokenList;