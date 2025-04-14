import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export const getProvider = () => {
  const { window } = globalThis;

  // Check if Phantom wallet is available in the browser
  if (window?.solana?.isPhantom) {
    // Instantiate the PhantomWalletAdapter
    const phantomWalletAdapter = new PhantomWalletAdapter();

    // You can then return this adapter instead of window.solana
    return phantomWalletAdapter;
  }

  // Add more checks for other wallets (e.g., Sollet, etc.)
  return null;
};
