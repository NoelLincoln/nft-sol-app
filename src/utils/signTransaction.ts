import { Transaction } from '@solana/web3.js';

import { PhantomProvider } from '../types';

/**
 * Signs a transaction
 * @param   {PhantomProvider} provider    a Phantom Provider
 * @param   {Transaction}     transaction a transaction to sign
 * @returns {Transaction}                 a signed transaction
 */
const signTransaction = async (provider: PhantomProvider, transaction: Transaction): Promise<Transaction> => {
  try {
    const signedTransaction = await provider.signTransaction(transaction);
    return signedTransaction;
  } catch (error) {
    console.warn(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export default signTransaction;