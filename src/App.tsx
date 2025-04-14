/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
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
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { percentAmount, generateSigner } from "@metaplex-foundation/umi";
import "@solana/wallet-adapter-react-ui/styles.css";
import bs58 from "bs58";

const endpoint = "https://api.devnet.solana.com";

const WalletInfo: React.FC = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    try {
      setLoading(true);
      setLogs([]);

      const umi = createUmi(endpoint)
        .use(walletAdapterIdentity(wallet))
        .use(mplTokenMetadata());

      const metadataUri = "https://gateway.pinata.cloud/ipfs/bafkreiaqw52kv3rbs6gkqb27wpz3ga3qmmvfjkskbjzpmiyrrgmjklqkku";

      log("Minting NFT...");
      const mint = generateSigner(umi);

      const nft = await createNft(umi, {
        mint,
        uri: metadataUri,
        name: "Demo NFT",
        symbol: "DNFT",
        sellerFeeBasisPoints: percentAmount(0),
      }).sendAndConfirm(umi);

      const base58Signature = bs58.encode(nft.signature);
      log("✅ NFT minted successfully!");
      log(`🧾 Signature: ${base58Signature}`);
      log(`🪙 Mint Token: ${mint.publicKey.toString()}`);
      log(
        `🔗 <a href="https://explorer.solana.com/tx/${base58Signature}?cluster=devnet" target="_blank" rel="noopener noreferrer">View on Explorer</a>`
      );
    } catch (e: any) {
      console.error("Minting failed", e);
      log(`❌ Minting failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
        <WalletMultiButton />
      </div>

      {wallet.publicKey && (
        <>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            <strong>Wallet connected:</strong> {wallet.publicKey.toBase58()}
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <button
              onClick={handleMint}
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "#7c3aed",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: "2rem", maxWidth: "600px", marginInline: "auto" }}>
          <h3>Mint Logs:</h3>
          <ul style={{ background: "#f4f4f5", padding: "1rem", borderRadius: "10px", fontSize: "14px" }}>
            {logs.map((log, idx) => (
              <li
                key={idx}
                style={{ marginBottom: "0.5rem" }}
                dangerouslySetInnerHTML={{ __html: log }}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
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
