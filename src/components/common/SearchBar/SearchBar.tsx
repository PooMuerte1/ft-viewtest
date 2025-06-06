import React from 'react';
import SearchAnalysisModal from '../SearchAnalysisModal/SearchAnalysisModal';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = '',
  className = '',
}) => {
  const [query, setQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validateAddress = (address: string) => {
    // Validar que sea una dirección Ethereum válida
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) {
      setError('Please enter a token address');
      return;
    }

    const address = query.trim();
    if (!validateAddress(address)) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsModalOpen(true);
    if (onSearch) {
      onSearch(address);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`w-full ${className}`}>
        <div className="relative flex items-center">
          {/* Icono de lupa a la izquierda */}
          <div className="absolute left-3 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input con padding para el icono */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-2 text-white bg-black border ${
              error ? 'border-red-500' : 'border-gray-700'
            } rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400`}
          />

          {/* Botón Analizar a la derecha */}
          <button
            type="submit"
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-r-lg transition-colors duration-200 font-medium"
          >
            Analyze
          </button>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </form>

      <SearchAnalysisModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setQuery('');
        }}
        userAddress={query}
      />
    </>
  );
};

export default SearchBar; 