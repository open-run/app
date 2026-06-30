import { useCallback } from "react";
import { useAppKit, useAccount } from "@reown/appkit-react-native";
import { ConnectionsController } from "@reown/appkit-core-react-native";

export function useSmartWallet() {
  const { open, close, disconnect } = useAppKit();
  const { address, isConnected, chainId } = useAccount();

  const connectWallet = useCallback(
    ({
      onSuccess,
      onError,
    }: {
      onSuccess?: (data: { accounts: string[] }) => void;
      onError?: (error: Error) => void;
    }) => {
      try {
        // AppKit 모달 열기
        // 연결 성공/실패는 index.tsx에서 useAccount를 통해 감지합니다
        open();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [open]
  );

  const closeWallet = useCallback(() => {
    try {
      close();
    } catch (error) {
      console.error("Failed to close wallet modal:", error);
    }
  }, [close]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, [disconnect]);

  const signMessage = useCallback(
    async (message: string) => {
      if (!address || chainId == null) {
        throw new Error("Wallet is not connected");
      }

      const signature = await ConnectionsController.signMessage(
        `eip155:${chainId}:${address}`,
        message
      );
      if (!signature) {
        throw new Error("Failed to sign message");
      }

      return signature;
    },
    [address, chainId]
  );

  return { address, connectWallet, closeWallet, disconnectWallet, isConnected, signMessage };
}
