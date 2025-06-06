import React, { createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useToast } from './ToastContext';

// Contract addresses
const CALCULATOR_ADDRESS = import.meta.env.VITE_CALCULATOR_CONTRACT_ADDRESS;
const NEW_CONTRACT_ADDRESS = import.meta.env.VITE_NEW_CONTRACT_ADDRESS;
const SELL_CONTRACT_ADDRESS = import.meta.env.VITE_SELL_CONTRACT_ADDRESS;

// ABIs
const ABI_CALCULATE = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "avaxAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
    ],
    "name": "calculatePurchaseAmountAndPrice",
    "outputs": [
      { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const NEW_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "address", "name": "tokenAddress", "type": "address" }
    ],
    "name": "safeBuyAndCreateLp",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];


const SELL_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "tokenBalanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface TradingContextType {
  buyToken: (tokenAddress: string, avaxAmount: number, tokenId: number | string) => Promise<void>;
  sellToken: (tokenAddress: string, percentage: number, tokenId: number | string) => Promise<void>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
  getTokenPrice: (tokenAddress: string, avaxAmount: number, tokenId: number | string) => Promise<string>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress, isConnected } = useWallet();
  const { showToast } = useToast();

  const getProvider = useCallback(() => {
    return new ethers.providers.JsonRpcProvider(import.meta.env.VITE_AVALANCHE_RPC_URL);
  }, []);

  const getSigner = useCallback(() => {
    const provider = getProvider();
    const privateKey = localStorage.getItem('wallet_private_key');
    if (!privateKey) throw new Error('No wallet connected');
    return new ethers.Wallet(privateKey, provider);
  }, [getProvider]);

  const getTokenBalance = useCallback(async (tokenAddress: string): Promise<string> => {
    if (!walletAddress) throw new Error('No wallet connected');
    
    const provider = getProvider();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );

    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals()
    ]);

    return ethers.utils.formatUnits(balance, decimals);
  }, [walletAddress, getProvider]);

  const getTokenPrice = useCallback(async (tokenAddress: string, avaxAmount: number, tokenId: number | string): Promise<string> => {
    try {
      console.log(tokenAddress)
      const provider = getProvider();
      const calculatorContract = new ethers.Contract(CALCULATOR_ADDRESS, ABI_CALCULATE, provider);
      const avaxAmountWei = ethers.utils.parseUnits(avaxAmount.toString(), 18);
      
      const [tokenAmount] = await calculatorContract.calculatePurchaseAmountAndPrice(avaxAmountWei, tokenId);
      return ethers.utils.formatUnits(tokenAmount, 18);
    } catch (error) {
      console.error('Error getting token price:', error);
      throw error;
    }
  }, [getProvider]);

  const buyToken = useCallback(async (tokenAddress: string, avaxAmount: number, tokenId: number | string) => {
    if (!isConnected || !walletAddress) {
      showToast({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    try {
      const provider = getProvider();
      const privateKey = localStorage.getItem('wallet_private_key');
      if (!privateKey) throw new Error('No wallet connected');

      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, NEW_CONTRACT_ABI, wallet);

      const avaxAmountWei = ethers.utils.parseUnits(avaxAmount.toString(), 18);

      showToast({ type: 'info', message: 'Processing Transaction...' });

      const tx = await contract.safeBuyAndCreateLp(tokenId, tokenAddress, {
        value: avaxAmountWei,
        gasLimit: 1000000,
        maxPriorityFeePerGas: ethers.utils.parseUnits('13', 'gwei'),
        maxFeePerGas: ethers.utils.parseUnits('233', 'gwei')
      });

      showToast({ type: 'info', message: 'Transaction sent. Waiting for confirmation...' });

      const receipt = await tx.wait();
      
      // Verificar si la compra fue exitosa
      const buyAttemptEvent = receipt.events.find((e: any) => 
        e.event === 'BuyAttempt' || 
        e.event === 'buyAttempt' || 
        e.event === 'Buy_Attempt' ||
        e.event === 'buy_attempt'
      );

      if (buyAttemptEvent) {
        console.log('Evento BuyAttempt encontrado:');
        console.log('Success:', buyAttemptEvent.args.success);
        console.log('Amount:', ethers.utils.formatEther(buyAttemptEvent.args.amount));
        console.log('Reason:', buyAttemptEvent.args.reason);

        if (buyAttemptEvent.args.success) {
          showToast({ type: 'success', message: `Transaction confirmed in block ${receipt.blockNumber}` });
          
          // Refrescar balance solo si la transacción fue exitosa
          const newBalance = await getTokenBalance(tokenAddress);
          console.log("New Token Balance:", newBalance);
        } else {
          throw new Error(buyAttemptEvent.args.reason || 'Transaction failed');
        }
      } else {
        // Si no encontramos el evento, asumimos que la transacción fue exitosa
        // ya que llegó hasta aquí sin errores
        showToast({ type: 'success', message: `Transaction confirmed in block ${receipt.blockNumber}` });
        const newBalance = await getTokenBalance(tokenAddress);
        console.log("New Token Balance:", newBalance);
      }

    } catch (error: any) {
      console.error('Error al comprar:', error);
      let errorMessage = 'Error while making the purchase. Please try again.';
      if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'The transaction was reversed. May be due to lack of liquidity or price impact.';
      } else if (error.message && error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient AVAX balance for the transaction.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast({ type: 'error', message: errorMessage });
    }
  }, [isConnected, walletAddress, getSigner, getProvider, getTokenBalance, showToast]);

  const sellToken = useCallback(async (tokenAddress: string, percentage: number, tokenId: number | string) => {
    if (!isConnected || !walletAddress) {
      showToast({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    try {
      const signer = getSigner();
      const provider = getProvider();

      // Get token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );

      const balance = await tokenContract.balanceOf(walletAddress);

      if (balance.isZero()) {
        throw new Error(`You have no tokens ${tokenAddress} to sell.`);
      }

      // Calculate amount to sell
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      const balanceInteger = formattedBalance.split('.')[0];
      const sellAmount = Math.floor(Number(balanceInteger) * percentage / 100).toString();

      if (sellAmount === '0') {
        throw new Error(`The calculated amount to sell (${percentage}%) is 0.`);
      }

      const amountToSell = ethers.utils.parseUnits(sellAmount, 18);

      // Execute sell
      const sellContract = new ethers.Contract(SELL_CONTRACT_ADDRESS, SELL_CONTRACT_ABI, signer);
      
      showToast({ type: 'info', message: 'Processing sell transaction...' });
      
      const tx = await sellContract.sell(amountToSell, tokenId, { 
        gasLimit: 500000
      });

      showToast({ type: 'info', message: `Sell transaction sent (${percentage}%). Hash: ${tx.hash}` });
      const receipt = await tx.wait();
      
      showToast({ type: 'success', message: `${percentage}% sell confirmed in block ${receipt.blockNumber}` });
    } catch (error: any) {
      console.error('Error selling token:', error);
      showToast({ 
        type: 'error', 
        message: error.message || 'Error selling token. Please try again.' 
      });
    }
  }, [isConnected, walletAddress, getSigner, getProvider, showToast]);

  return (
    <TradingContext.Provider
      value={{
        buyToken,
        sellToken,
        getTokenBalance,
        getTokenPrice
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}; 