import "@walletconnect/react-native-compat";
import "../polyfills";

import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import { Stack } from "expo-router";
import { AppKitProvider, AppKit } from "@reown/appkit-react-native";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appKit, wagmiConfig } from "../appKitConfig";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppKitProvider instance={appKit}>
        {/* @ts-ignore - wagmi 버전 불일치로 인한 타입 에러 */}
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
            <AppKit />
          </QueryClientProvider>
        </WagmiProvider>
      </AppKitProvider>
    </SafeAreaProvider>
  );
}
