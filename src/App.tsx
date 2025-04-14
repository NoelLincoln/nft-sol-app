// App.tsx
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

// include styles once
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletInfo: React.FC = () => {
  const { publicKey } = useWallet();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
        <WalletMultiButton />
      </div>
      {publicKey && (
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "1rem" }}>
          <strong>Wallet connected:</strong> {publicKey.toBase58()}
        </p>
      )}
    </>
  );
};

const App: React.FC = () => {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletInfo />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
