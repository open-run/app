import { useCallback } from "react";
import { useAppKit, useAccount } from "@reown/appkit-react-native";

export function useSmartWallet() {
  const { open, disconnect } = useAppKit();
  const { address, isConnected } = useAccount();

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

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return { address, connectWallet, disconnectWallet, isConnected };
}
