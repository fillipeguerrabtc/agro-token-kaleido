import { createContext, useContext, useState, useEffect } from "react";

type WalletInfo = {
  address: string;
  name: string;
  ethBalance: string;
  brlxBalance: string;
};

type WalletContextType = {
  wallet: WalletInfo | null;
  setWallet: (wallet: WalletInfo | null) => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(() => {
    const stored = localStorage.getItem("wallet");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
    } else {
      localStorage.removeItem("wallet");
    }
  }, [wallet]);

  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem("wallet");
  };

  return (
    <WalletContext.Provider value={{ wallet, setWallet, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
