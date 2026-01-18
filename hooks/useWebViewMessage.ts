import { useCallback } from "react";
import { WebViewMessageEvent } from "react-native-webview";
import { requestGeolocation } from "@utils/geolocation";
import { executeVibration } from "@utils/vibration";
import { Message, VibrationType } from "@constants/message";
import { log } from "@utils/log";

interface UseWebViewMessageProps {
  address: string | undefined;
  disconnectWallet: () => void;
  handleConnectRequest: () => void;
  postMessage: (message: any) => void;
}

/**
 * WebView 메시지 처리를 담당하는 훅
 */
export function useWebViewMessage({
  address,
  disconnectWallet,
  handleConnectRequest,
  postMessage,
}: UseWebViewMessageProps) {
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const rawData = event.nativeEvent.data;
        log("📨 [Native] Received message from WebView:", rawData);

        const data = JSON.parse(rawData);
        log("📦 [Native] Parsed message data:", data);
        log("🔍 [Native] Message type:", data.type);

        switch (data.type) {
          /* 스마트월렛 연결 */
          case Message.REQUEST_SMART_WALLET_CONNECT:
            log("REQUEST_SMART_WALLET_CONNECT");
            handleConnectRequest();
            break;

          /* 스마트월렛 연결 해제 */
          case Message.DISCONNECT_SMART_WALLET:
            log("DISCONNECT_SMART_WALLET");
            address && disconnectWallet();
            break;

          case Message.REQUEST_GEOLOCATION:
            const location = await requestGeolocation();
            log("Geolocation", location);
            if (location) {
              postMessage({
                type: Message.GEOLOCATION,
                data: location,
              });
            } else {
              postMessage({
                type: Message.GEOLOCATION_ERROR,
                message: "위치 정보를 가져올 수 없습니다.",
              });
            }
            break;

          case Message.REQUEST_VIBRATION:
            const vibrationType = data.data?.vibrationType || VibrationType.IMPACT_MEDIUM;
            await executeVibration(vibrationType);
            break;

          default:
            console.info("MESSAGE from WebView", data);
            break;
        }
      } catch (error) {
        log("❌ [Native] Error processing message:", error);
        console.error("Failed to process WebView message:", error);
      }
    },
    [address, disconnectWallet, handleConnectRequest, postMessage]
  );

  return { handleMessage };
}
