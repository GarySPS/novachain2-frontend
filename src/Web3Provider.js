// src/Web3Provider.js
import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { mainnet, bsc } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = 'f9d63295119b677c0e58f3e0f7aee760';

// Keep WalletConnect metadata aligned with whichever Novachain domain is open.
const siteOrigin =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.novachain.digital';

const metadata = {
  name: 'NovaChain',
  description: 'NovaChain Crypto Platform',
  url: siteOrigin,
  icons: [`${siteOrigin}/logo192_new.png`]
};

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, bsc],
  projectId
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, bsc],
  projectId,
  metadata,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}