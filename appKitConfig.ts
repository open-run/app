import "@walletconnect/react-native-compat";

import { createAppKit, type Storage } from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { base, baseSepolia } from "wagmi/chains"; // EVM 체인만 사용 (Base 메인넷 및 테스트넷)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import * as Linking from "expo-linking";

const PREFIX_URL = Linking.createURL("/");

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "ad41cd1ed822293016042e1a5bc4b5f2";

// 지갑 ID 상수
const WALLET_ID_METAMASK = "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";
const WALLET_ID_TRUST_WALLET = "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0";
const WALLET_ID_BINANCE_WALLET = "c03dfee351b6fcc421b4494ea33b9d4b5a73a16eb3a21e3e44f81d2fde2c1e4e";
const WALLET_ID_COINBASE_WALLET = "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa";

// Storage 구현
const storage: Storage = {
  getKeys: async () => (await AsyncStorage.getAllKeys()) as string[],
  getEntries: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await Promise.all(
      keys.map(async (key) => {
        const raw = await AsyncStorage.getItem(key);
        return [key, safeJsonParse(raw ?? "")] as [string, any];
      })
    );
    return entries;
  },
  getItem: async <T = any>(key: string) => {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null || raw === undefined) return undefined;
    return safeJsonParse(raw) as T;
  },
  setItem: async <T = any>(key: string, value: T) => {
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

// WagmiAdapter 초기화 (EVM 체인만 사용, Base 메인넷 및 테스트넷)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base, baseSepolia], // Base 메인넷 및 테스트넷
});

// WagmiConfig export (WagmiProvider에서 사용)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// AppKit 인스턴스 생성 (EVM 체인만 사용, Base 메인넷 및 테스트넷)
export const appKit = createAppKit({
  projectId,
  networks: [base, baseSepolia], // Base 메인넷 및 테스트넷
  defaultNetwork: baseSepolia, // Base 메인넷을 기본 네트워크로 설정
  adapters: [wagmiAdapter],
  storage,
  features: {
    socials: [
      'google',   // Google 로그인
      'apple',    // Apple 로그인
      'discord',  // Discord 로그인
      'x',        // X (Twitter) 로그인
      'github',   // GitHub 로그인
      'farcaster', // Farcaster 로그인
      // 'facebook', // Facebook은 모바일에서 지원되지 않음
    ],
    showWallets: true, // 지갑 옵션 표시
  },
  // Base 네트워크를 지원하는 지갑만 표시 (EVM 체인만 사용, Base 메인넷 및 테스트넷)
  featuredWalletIds: [
    WALLET_ID_METAMASK,        // Base 지원
    WALLET_ID_TRUST_WALLET,    // Base 지원
    WALLET_ID_BINANCE_WALLET,  // Base 지원
    WALLET_ID_COINBASE_WALLET, // Base 지원
  ],
  metadata: {
    name: "Open Run",
    description: "Open Run App",
    url: "https://open-run.vercel.app",
    icons: [],
    redirect: {
      native: PREFIX_URL,
      universal: "https://open-run.vercel.app",
    },
  },
});
