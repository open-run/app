import "../polyfills";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, createStorage, http, WagmiProvider } from "wagmi";
import React from "react";
import { Stack } from "expo-router";
import { base, baseSepolia } from "wagmi/chains";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createConnectorFromWallet, Wallets } from "@mobile-wallet-protocol/wagmi-connectors";
import * as Linking from "expo-linking";
import { WebViewProvider } from "@components/WebViewProvider";

polyfillForWagmi();

const PREFIX_URL = Linking.createURL("/");

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    createConnectorFromWallet({
      metadata: {
        name: "Open Run",
        customScheme: PREFIX_URL,
      },
      wallet: Wallets.CoinbaseSmartWallet,
    }),
  ],
  storage: createStorage({
    storage: AsyncStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <SafeAreaProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <WebViewProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="bung" options={{ headerShown: false }} />
              <Stack.Screen name="avatar" options={{ headerShown: false }} />
            </Stack>
          </WebViewProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SafeAreaProvider>
  );
}

function polyfillForWagmi() {
  const noop = (() => {}) as any;

  window.addEventListener = noop;
  window.dispatchEvent = noop;
  window.removeEventListener = noop;
  window.CustomEvent = function CustomEvent() {
    return {};
  } as any;
}
