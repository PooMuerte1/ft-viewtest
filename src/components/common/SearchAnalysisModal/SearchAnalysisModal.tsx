import React from 'react';
import { useToast } from '../../../context/ToastContext';

interface SearchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
}

interface TokenInfo {
  id: string;
  name: string;
  transfervalue: string;
  saleAmount: string | null;
  rug: boolean;
  date: string;
}

interface TokenAnalysis {
  success: boolean;
  totalTokens: number;
  totalRugs: number;
  rugs: TokenInfo[];
}

const SearchAnalysisModal: React.FC<SearchAnalysisModalProps> = ({
  isOpen,
  onClose,
  userAddress,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [analysis, setAnalysis] = React.useState<TokenAnalysis | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSection, setExpandedSection] = React.useState<'rugged' | 'safe' | null>(null);
  const { showToast } = useToast();

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token/rug-verifier/${userAddress}`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to fetch token analysis');
      showToast({ type: 'error', message: 'Error fetching token analysis' });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && userAddress) {
      fetchAnalysis();
    }
  }, [isOpen, userAddress]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatAmount = (amount: string) => {
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const TokenSummary: React.FC<{ token: TokenInfo }> = ({ token }) => (
    <div className={`p-3 rounded-lg ${
      token.rug 
        ? 'bg-red-900/30 border border-red-700' 
        : 'bg-green-900/30 border border-green-700'
    }`}>
      <div className="flex flex-col gap-2">
        {/* Header with name and date */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">
              {token.name}
            </h4>
            {token.rug && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-300 rounded-full">
                Rugged
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(token.date)}
          </p>
        </div>

        {/* Token details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/20 rounded p-2">
            <p className="text-gray-400 mb-1">Purchased Tokens</p>
            <p className="text-white font-medium">
              ${formatAmount(token.transfervalue)}
            </p>
          </div>
          {token.saleAmount && (
            <div className="bg-black/20 rounded p-2">
              <p className="text-gray-400 mb-1">Sale Tokens Amount</p>
              <p className="text-white font-medium">
                ${formatAmount(token.saleAmount)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4 relative">
        {/* Header with close button */}
        <div className="sticky top-0 bg-gray-900 rounded-t-lg border-b border-gray-700 p-3 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white">Creator Analysis</h2>
            <p className="text-gray-400 text-xs break-all">
              {userAddress}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors duration-200"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-2"></div>
              <p className="text-gray-400 text-xs">Analyzing creator...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-4 text-xs">
              {error}
            </div>
          ) : analysis ? (
            <>
              {/* Summary Section */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="text-white text-sm font-semibold">
                      {analysis.totalTokens}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Rugged</p>
                    <p className="text-red-400 text-sm font-semibold">
                      {analysis.totalRugs}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Safe</p>
                    <p className="text-green-400 text-sm font-semibold">
                      {analysis.totalTokens - analysis.totalRugs}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rugged Tokens Section */}
              {analysis.totalRugs > 0 && (
                <div className="">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'rugged' ? null : 'rugged')}
                    className="w-full flex justify-between items-center p-2 bg-red-900/30 rounded-lg hover:bg-red-900/40 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-white">Rugged Tokens ({analysis.totalRugs})</h3>
                    <svg
                      className={`w-4 h-4 text-white transform transition-transform ${
                        expandedSection === 'rugged' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSection === 'rugged' && (
                    <div className="mt-2 space-y-2 overflow-y-auto max-h-56 pr-1 custom-scrollbar overflow-x-hidden">
                      {analysis.rugs.filter(token => token.rug).map((token) => (
                        <TokenSummary key={token.id} token={token} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Safe Tokens Section */}
              {analysis.totalTokens - analysis.totalRugs > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'safe' ? null : 'safe')}
                    className="w-full flex justify-between items-center p-2 bg-green-900/30 rounded-lg hover:bg-green-900/40 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-white">
                      Safe Tokens ({analysis.totalTokens - analysis.totalRugs})
                    </h3>
                    <svg
                      className={`w-4 h-4 text-white transform transition-transform ${
                        expandedSection === 'safe' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSection === 'safe' && (
                    <div className="mt-2 space-y-2 overflow-y-auto max-h-56 pr-1 custom-scrollbar overflow-x-hidden">
                      {analysis.rugs.filter(token => !token.rug).map((token) => (
                        <TokenSummary key={token.id} token={token} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Add custom scrollbar styles at the top of the file after imports
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Add the styles to the document
const style = document.createElement('style');
style.textContent = customScrollbarStyles;
document.head.appendChild(style);

export default SearchAnalysisModal; 