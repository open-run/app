import { useEffect, useRef, useCallback } from "react";
import { useAppKitState } from "@reown/appkit-react-native";
import { useSmartWallet } from "./useSmartWallet";
import { useAppStateListener } from "./useAppStateListener";
import { Message } from "@constants/message";
import { log } from "@utils/log";

const MAX_RETRY_COUNT = 2; // 최대 재시도 횟수

interface UseWalletConnectionProps {
  postMessage: (message: any) => void;
}

/**
 * 지갑 연결, 재시도, 모달 관리 로직을 담당하는 훅
 */
export function useWalletConnection({ postMessage }: UseWalletConnectionProps) {
  const { address, connectWallet, closeWallet, isConnected } = useSmartWallet();
  const { isOpen } = useAppKitState();
  const { appWentToBackgroundRef, reset: resetAppState } = useAppStateListener(isOpen);

  const pendingConnectRef = useRef<boolean>(false);
  const previousAddressRef = useRef<string | undefined>(undefined);
  const wasModalOpenRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);

  const handleConnectionSuccess = useCallback(
    (newAddress: string) => {
      previousAddressRef.current = newAddress;
      pendingConnectRef.current = false;
      retryCountRef.current = 0;
      resetAppState();
      postMessage({
        type: Message.RESPONSE_SMART_WALLET_CONNECT,
        data: newAddress,
      });
      // address가 할당되어 웹뷰로 전송되면 모달 자동 닫기
      if (isOpen) {
        log("✅ [Native] address 할당 완료, 모달 자동 닫기");
        closeWallet();
      }
    },
    [isOpen, closeWallet, resetAppState, postMessage]
  );

  // 모달 열림/닫힘 감지 및 자동 재시도 로직
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    // 모달이 열릴 때 초기화
    if (!wasModalOpenRef.current && isOpen) {
      resetAppState();
      log("📱 [Native] 모달 열림");
    }

    // 모달이 닫힐 때 처리
    if (wasModalOpenRef.current && !isOpen) {
      log(`📱 [Native] 모달 닫힘. 앱이 백그라운드로 갔었는지: ${appWentToBackgroundRef.current}`);

      // address가 연결되어 있으면 RESPONSE_SMART_WALLET_CONNECT 전송
      if (address && address !== previousAddressRef.current) {
        handleConnectionSuccess(address);
      } else if (!address) {
        const isUserCancelled = !appWentToBackgroundRef.current;

        if (isUserCancelled) {
          log("❌ [Native] 사용자가 모달을 취소함 (앱이 백그라운드로 가지 않음). 재시도하지 않음");
          pendingConnectRef.current = false;
          retryCountRef.current = 0;
          resetAppState();
          postMessage({
            type: Message.WALLET_MODAL_CLOSED,
          });
        } else if (pendingConnectRef.current && retryCountRef.current < MAX_RETRY_COUNT) {
          // 지갑 앱으로 이동했다가 돌아온 경우 (앱이 백그라운드로 갔다가 돌아옴)
          retryCountRef.current += 1;
          resetAppState(); // 재시도 전 리셋
          log(`🔄 [Native] 모달이 닫혔지만 address가 없음. 지갑 앱에서 돌아온 것으로 간주. 자동 재시도 (${retryCountRef.current}/${MAX_RETRY_COUNT})`);

          // 약간의 딜레이 후 자동으로 모달 다시 열기
          timeoutId = setTimeout(() => {
            if (!address && !isOpen && pendingConnectRef.current) {
              log("🔄 [Native] 자동으로 지갑 연결 모달 다시 열기");
              connectWallet({
                onSuccess: (data) => {
                  const address = data.accounts[0];
                  handleConnectionSuccess(address);
                },
                onError: (error) => {
                  log("❌ [Native] 자동 재시도 실패:", error.message);
                  if (retryCountRef.current >= MAX_RETRY_COUNT) {
                    pendingConnectRef.current = false;
                    retryCountRef.current = 0;
                    resetAppState();
                    postMessage({
                      type: Message.RESPONSE_SMART_WALLET_CONNECT_ERROR,
                      data: error.message,
                    });
                  }
                },
              });
            }
          }, 500); // 500ms 딜레이
        } else {
          // 재시도 횟수 초과 또는 연결 시도가 아닌 경우
          if (pendingConnectRef.current) {
            pendingConnectRef.current = false;
            retryCountRef.current = 0;
            resetAppState();
          }
          log("WALLET_MODAL_CLOSED");
          postMessage({
            type: Message.WALLET_MODAL_CLOSED,
          });
        }
      }
    }
    wasModalOpenRef.current = isOpen;

    // cleanup 함수로 timeout 정리
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, address, connectWallet, closeWallet, handleConnectionSuccess, resetAppState, postMessage]);

  // 연결 상태 변경 감지 (주소가 변경되면 연결 성공으로 간주)
  useEffect(() => {
    if (pendingConnectRef.current && address && address !== previousAddressRef.current) {
      handleConnectionSuccess(address);
    }
    previousAddressRef.current = address;
  }, [address, isConnected, handleConnectionSuccess]);

  const handleConnectRequest = () => {
    if (address) {
      postMessage({
        type: Message.RESPONSE_SMART_WALLET_CONNECT,
        data: address,
      });
      return;
    }

    pendingConnectRef.current = true;
    retryCountRef.current = 0;
    connectWallet({
      onSuccess: (data) => {
        const address = data.accounts[0];
        handleConnectionSuccess(address);
      },
      onError: (error) => {
        pendingConnectRef.current = false;
        retryCountRef.current = 0;
        postMessage({
          type: Message.RESPONSE_SMART_WALLET_CONNECT_ERROR,
          data: error.message,
        });
      },
    });
  };

  return {
    address,
    handleConnectRequest,
    pendingConnectRef,
  };
}
