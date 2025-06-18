import { useCallback } from "react";
import { Config, useAccount, useConnect, useDisconnect } from "wagmi";
import { ConnectData } from "wagmi/query";

export function useSmartWallet() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(
    ({
      onSuccess,
      onError,
    }: {
      onSuccess?: (data: ConnectData<Config>) => void;
      onError?: (error: Error) => void;
    }) => {
      connect(
        { connector: connectors[0] },
        {
          onSuccess,
          onError,
        }
      );
    },
    []
  );

  const disconnectWallet = useCallback(() => {
    disconnect({ connector: connectors[0] });
  }, []);

  return { address, connectWallet, disconnectWallet };
}
