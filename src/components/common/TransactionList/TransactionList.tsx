import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ethers } from 'ethers';

interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  avaxValue?: number;
  type: 'buy' | 'sell' | 'transfer';
}

interface TransactionListProps {
  contractAddress: string;
}

// Memoized row component to prevent unnecessary re-renders
const TransactionRow = memo(({ tx }: { tx: Transaction }) => {
  const displayAddress = useMemo(() => 
    tx.type === 'buy' ? tx.to : tx.type === 'sell' ? tx.from : tx.from,
    [tx.type, tx.to, tx.from]
  );

  const rowBgColor = useMemo(() => 
    tx.type === 'buy' 
      ? 'hover:bg-green-900' 
      : tx.type === 'sell' 
      ? 'hover:bg-red-900' 
      : 'hover:bg-gray-900 bg-gray-900',
    [tx.type]
  );
  
  const rowLeftBorderClass = useMemo(() => {
    if (tx.type === 'buy') return 'border-l-4 border-green-500';
    if (tx.type === 'sell') return 'border-l-4 border-red-500';
    return '';
  }, [tx.type]);
  const formattedDate = useMemo(() => 
    new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    [tx.timeStamp]
  );

  const formattedAmount = useMemo(() => {
    try {
      const amount = ethers.utils.formatUnits(tx.value, tx.tokenDecimal);
      return parseFloat(amount).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0';
    }
  }, [tx.value, tx.tokenDecimal]);

  const formattedAddress = useMemo(() => {
    if (!displayAddress) return '';
    return `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`;
  }, [displayAddress]);

  return (
    <tr className={`transition-colors ${rowBgColor}`}>
      <td className={`px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap ${rowLeftBorderClass}`}>
        {formattedDate}
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-300 whitespace-nowrap">
        <a
          href={`https://snowtrace.io/address/${displayAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
          title={displayAddress}
        >
          {formattedAddress}
        </a>
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-300 text-right whitespace-nowrap">
        <span title={`${formattedAmount} ${tx.tokenSymbol}`}>
          {formattedAmount}
        </span>
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-300 text-right whitespace-nowrap">
        {tx.avaxValue?.toFixed(2)}
      </td>
    </tr>
  );
});

TransactionRow.displayName = 'TransactionRow';

const TransactionList: React.FC<TransactionListProps> = ({ contractAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fetchInProgress = React.useRef(false);

  const cleanup = useCallback(() => {
    console.log(isProcessing)
    setTransactions([]);
    setLoading(true);
    setError(null);
    setIsProcessing(false);
    fetchInProgress.current = false;
  }, []);

  const weiToAvax = useCallback((valueHex: string) => {
    try {
      const weiValue = BigInt(valueHex);
      const avaxValue = Number(weiValue) / 1e18;
      return avaxValue;
    } catch (error) {
      console.error('Error converting wei to AVAX:', error);
      return 0;
    }
  }, []);

  const getTransactionType = useCallback((from: string, to: string): 'buy' | 'sell' | 'transfer' => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (from.toLowerCase() === zeroAddress.toLowerCase()) return 'buy';
    if (to.toLowerCase() === zeroAddress.toLowerCase()) return 'sell';
    return 'transfer';
  }, []);

  const fetchTransactionDetails = useCallback(async (hash: string): Promise<number> => {
    try {
      const response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [hash],
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.result && data.result.value) {
        return weiToAvax(data.result.value);
      }
      return 0;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return 0;
    }
  }, [weiToAvax]);

  const getInternalOperations = useCallback(async (txHash: string) => {
    try {
      const response = await fetch(
        `https://api.routescan.io/v2/network/mainnet/evm/43114/internal-operations?txHash=${txHash}&sort=desc`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching internal operations:', error);
      return [];
    }
  }, []);

  const sumInternalValues = useCallback((internalOps: any[]) => {
    try {
      const totalWei = internalOps.reduce((acc, op) => acc + BigInt(op.value || '0'), BigInt(0));
      return Number(totalWei) / 1e18;
    } catch (error) {
      console.error('Error summing internal values:', error);
      return 0;
    }
  }, []);

  const getTransactionAvaxValue = useCallback(async (tx: any): Promise<number> => {
    const type = getTransactionType(tx.from, tx.to);
    
    if (type === 'buy') {
      return await fetchTransactionDetails(tx.hash);
    } else if (type === 'sell') {
      const internalOps = await getInternalOperations(tx.hash);
      return sumInternalValues(internalOps);
    }
    
    return 0;
  }, [fetchTransactionDetails, getInternalOperations, getTransactionType, sumInternalValues]);

  const fetchTransactions = useCallback(async () => {
    if (!contractAddress || fetchInProgress.current) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setIsProcessing(true);
      setLoading(true);
      setError(null);
      setTransactions([]);

      const response = await fetch(
        `https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=10000&sort=desc`
      );

      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < data.result.length; i += batchSize) {
          batches.push(data.result.slice(i, i + batchSize));
        }

        const allProcessedTransactions: Transaction[] = [];
        for (const batch of batches) {
          const batchResults = await Promise.all(
            batch.map(async (tx: any) => {
              const avaxValue = await getTransactionAvaxValue(tx);
              return {
                ...tx,
                avaxValue,
                type: getTransactionType(tx.from, tx.to),
              };
            })
          );
          allProcessedTransactions.push(...batchResults);
        }
        
        setTransactions(allProcessedTransactions);
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Error loading transactions');
    } finally {
      setLoading(false);
      setIsProcessing(false);
      fetchInProgress.current = false;
    }
  }, [contractAddress, getTransactionAvaxValue, getTransactionType]);

  // Single effect to handle data fetching
  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      if (!mounted) return;
      
      cleanup();
      if (contractAddress) {
        await fetchTransactions();
      }
    };

    loadTransactions();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [contractAddress]); // Only depend on contractAddress

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      );
    }

    return (
      <table className="w-full divide-y divide-gray-800">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase w-[22%]">Date</th>
            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase w-[40%]">Address</th>
            <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-400 uppercase w-[19%]">Amount</th>
            <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-400 uppercase w-[19%]">AVAX</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {transactions.map((tx) => (
            <TransactionRow key={tx.hash} tx={tx} />
          ))}
        </tbody>
      </table>
    );
  }, [loading, error, transactions]);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="overflow-x-hidden">
        {tableContent}
      </div>
    </div>
  );
};

export default memo(TransactionList); 