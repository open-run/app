import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { requestGeolocation } from "@utils/geolocation";
import { Message } from "@constants/message";
import { URL } from "@constants/index";
import { log } from "@utils/log";
import { useSmartWallet } from "@hooks/useSmartWallet";
import { useAppKitState } from "@reown/appkit-react-native";

export default function HomeScreen() {
  const { address, connectWallet, disconnectWallet, isConnected } = useSmartWallet();
  const { isOpen } = useAppKitState();
  const webViewRef = useRef<WebView>(null);
  const pendingConnectRef = useRef<boolean>(false);
  const previousAddressRef = useRef<string | undefined>(undefined);
  const wasModalOpenRef = useRef<boolean>(false);

  const postMessage = (message: any) => {
    log("POST MESSAGE TO WEBVIEW", message);
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  // 모달 닫힘 감지
  useEffect(() => {
    if (wasModalOpenRef.current && !isOpen) {
      // 모달이 닫혔는데 연결이 안 되었다면 pending 상태 해제
      if (pendingConnectRef.current) {
        pendingConnectRef.current = false;
      }
      // address가 연결되어 있으면 RESPONSE_SMART_WALLET_CONNECT 전송
      if (address && address !== previousAddressRef.current) {
        previousAddressRef.current = address;
        postMessage({
          type: Message.RESPONSE_SMART_WALLET_CONNECT,
          data: address,
        });
      } else if (!address) {
        // address가 없을 때만 WALLET_MODAL_CLOSED 전송
        log("WALLET_MODAL_CLOSED");
        postMessage({
          type: Message.WALLET_MODAL_CLOSED,
        });
      }
    }
    wasModalOpenRef.current = isOpen;
  }, [isOpen, address]);

  // 연결 상태 변경 감지 (주소가 변경되면 연결 성공으로 간주)
  useEffect(() => {
    if (pendingConnectRef.current && address && address !== previousAddressRef.current) {
      pendingConnectRef.current = false;
      previousAddressRef.current = address;
      postMessage({
        type: Message.RESPONSE_SMART_WALLET_CONNECT,
        data: address,
      });
    }
    previousAddressRef.current = address;
  }, [address, isConnected]);

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      /* 스마트월렛 연결 */
      case Message.REQUEST_SMART_WALLET_CONNECT:
        log("REQUEST_SMART_WALLET_CONNECT");

        if (address) {
          postMessage({
            type: Message.RESPONSE_SMART_WALLET_CONNECT,
            data: address,
          });
          return;
        }

        pendingConnectRef.current = true;
        connectWallet({
          onSuccess: (data) => {
            const address = data.accounts[0];
            postMessage({
              type: Message.RESPONSE_SMART_WALLET_CONNECT,
              data: address,
            });
          },
          onError: (error) => {
            pendingConnectRef.current = false;
            postMessage({
              type: Message.RESPONSE_SMART_WALLET_CONNECT_ERROR,
              data: error.message,
            });
          },
        });
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

      default:
        console.info("MESSAGE from WebView", data);
        break;
    }
  };

  return (
    <View style={styles.safearea}>
      <WebView
        ref={webViewRef}
        source={{ uri: URL }}
        geolocationEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={onMessage}
        startInLoadingState
        renderLoading={() => <></>}
        allowsBackForwardNavigationGestures
        bounces={false}
        overScrollMode="never"
        allowsLinkPreview={false}
        webviewDebuggingEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safearea: { flex: 1 }, // 전체 화면으로 만들기
});
