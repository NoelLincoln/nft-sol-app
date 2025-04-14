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
// import signAndSendTransaction from "./utils/signAndSendTransaction";
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// const endpoint = "https://api.devnet.solana.com";

// const endpoint = "https://api.mainnet-beta.solana.com"

// const endpoint = "https://alpha-tame-dinghy.solana-mainnet.quiknode.pro/24f6b6225e2dee000e1a6e7f1afecbba8980decb/"
const endpoint = "https://mainnet.helius-rpc.com/?api-key=9c13c71d-3088-4fc4-bc03-7c7a270b0bcd"

const WalletInfo: React.FC = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleMint = async () => {
    if (!wallet.publicKey || !window.solana) return;
  
    try {
      setLoading(true);
      setLogs([]);
  
      const connection = new Connection(endpoint);
      const buyer = wallet.publicKey;
      const seller = new PublicKey("FQ1qSLJzpBtBbiKjqnpUPLFWbn8MM4c4TeNyeDLV6rxt");
      const amount = 0.005 * LAMPORTS_PER_SOL;
  
      // STEP 1: Transfer SOL using Phantom-native method
      log("Requesting 0.005 SOL payment...");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: buyer,
          toPubkey: seller,
          lamports: amount,
        })
      );
  
      transaction.feePayer = buyer;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
      // ✅ Use Phantom's native method: unsigned tx passed directly
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature, "confirmed");
  
      log(`💸 Payment successful: <a href="https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta" target="_blank">View</a>`);
  
      // STEP 2: Mint NFT
      log("Minting NFT...");
      const umi = createUmi(endpoint)
        .use(walletAdapterIdentity(wallet))
        .use(mplTokenMetadata());
  
      const metadataUri =
        "https://gateway.pinata.cloud/ipfs/bafkreiaqw52kv3rbs6gkqb27wpz3ga3qmmvfjkskbjzpmiyrrgmjklqkku";
  
      const mint = generateSigner(umi);
  
      const nft = await createNft(umi, {
        mint,
        uri: metadataUri,
        name: "Demo NFT",
        symbol: "DNFT",
        sellerFeeBasisPoints: percentAmount(0),
        tokenOwner: umi.identity.publicKey, // ✅ ensures the NFT is sent to the connected wallet
      }).sendAndConfirm(umi);
  
      const base58Signature = bs58.encode(nft.signature);
      log("✅ NFT minted successfully!");
      log(`🧾 Signature: ${base58Signature}`);
      log(`🪙 Mint Token: ${mint.publicKey.toString()}`);
      log(
        `🔗 <a href="https://explorer.solana.com/tx/${base58Signature}?cluster=mainnet-beta" target="_blank" rel="noopener noreferrer">View on Explorer</a>`
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
