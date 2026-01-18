import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { requestGeolocation } from "@utils/geolocation";
import { Message, VibrationType } from "@constants/message";
import { URL } from "@constants/index";
import { log } from "@utils/log";
import { useSmartWallet } from "@hooks/useSmartWallet";
import { useAppKitState } from "@reown/appkit-react-native";

export default function HomeScreen() {
  const { address, connectWallet, closeWallet, disconnectWallet, isConnected } = useSmartWallet();
  const { isOpen } = useAppKitState();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const pendingConnectRef = useRef<boolean>(false);
  const previousAddressRef = useRef<string | undefined>(undefined);
  const wasModalOpenRef = useRef<boolean>(false);
  const hasSentInsetsRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRY_COUNT = 2; // 최대 재시도 횟수

  const postMessage = (message: any) => {
    log("POST MESSAGE TO WEBVIEW", message);
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  // 웹뷰가 처음 로드될 때 inset 값 전달
  const handleLoadEnd = () => {
    if (!hasSentInsetsRef.current) {
      const insetData = {
        top: insets.top,
        bottom: insets.bottom,
      };
      log("📱 [Native] Sending inset values to WebView:", insetData);
      postMessage({
        type: Message.INSET,
        data: insetData,
      });
      hasSentInsetsRef.current = true;
    }
  };

  // 모달 닫힘 감지
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (wasModalOpenRef.current && !isOpen) {
      // address가 연결되어 있으면 RESPONSE_SMART_WALLET_CONNECT 전송
      if (address && address !== previousAddressRef.current) {
        previousAddressRef.current = address;
        pendingConnectRef.current = false;
        retryCountRef.current = 0; // 성공 시 재시도 횟수 리셋
        postMessage({
          type: Message.RESPONSE_SMART_WALLET_CONNECT,
          data: address,
        });
        // address가 할당되어 웹뷰로 전송되면 모달 자동 닫기
        if (isOpen) {
          log("✅ [Native] address 할당 완료, 모달 자동 닫기");
          closeWallet();
        }
      } else if (!address) {
        // address가 없고 연결 시도 중인 경우 자동 재시도
        if (pendingConnectRef.current && retryCountRef.current < MAX_RETRY_COUNT) {
          retryCountRef.current += 1;
          log(`🔄 [Native] 모달이 닫혔지만 address가 없음. 자동 재시도 (${retryCountRef.current}/${MAX_RETRY_COUNT})`);
          
          // 약간의 딜레이 후 자동으로 모달 다시 열기
          timeoutId = setTimeout(() => {
            // 재시도 시점에 다시 한 번 확인 (ref를 통해 최신 값 확인)
            if (!address && !isOpen && pendingConnectRef.current) {
              log("🔄 [Native] 자동으로 지갑 연결 모달 다시 열기");
              connectWallet({
                onSuccess: (data) => {
                  const address = data.accounts[0];
                  pendingConnectRef.current = false;
                  retryCountRef.current = 0;
                  postMessage({
                    type: Message.RESPONSE_SMART_WALLET_CONNECT,
                    data: address,
                  });
                  // address가 할당되어 웹뷰로 전송되면 모달 자동 닫기
                  if (isOpen) {
                    log("✅ [Native] address 할당 완료, 모달 자동 닫기");
                    closeWallet();
                  }
                },
                onError: (error) => {
                  log("❌ [Native] 자동 재시도 실패:", error.message);
                  if (retryCountRef.current >= MAX_RETRY_COUNT) {
                    pendingConnectRef.current = false;
                    retryCountRef.current = 0;
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
          }
          // address가 없을 때만 WALLET_MODAL_CLOSED 전송
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
  }, [isOpen, address, connectWallet, closeWallet]);

  // 연결 상태 변경 감지 (주소가 변경되면 연결 성공으로 간주)
  useEffect(() => {
    if (pendingConnectRef.current && address && address !== previousAddressRef.current) {
      pendingConnectRef.current = false;
      retryCountRef.current = 0; // 성공 시 재시도 횟수 리셋
      previousAddressRef.current = address;
      postMessage({
        type: Message.RESPONSE_SMART_WALLET_CONNECT,
        data: address,
      });
      // address가 할당되어 웹뷰로 전송되면 모달 자동 닫기
      if (isOpen) {
        log("✅ [Native] address 할당 완료, 모달 자동 닫기");
        closeWallet();
      }
    }
    previousAddressRef.current = address;
  }, [address, isConnected, isOpen, closeWallet]);

  const onMessage = async (event: WebViewMessageEvent) => {
    try {
      const rawData = event.nativeEvent.data;
      log("📨 [Native] Received message from WebView:", rawData);
      
      const data = JSON.parse(rawData);
      log("📦 [Native] Parsed message data:", data);
      log("🔍 [Native] Message type:", data.type);
      log("🔍 [Native] Expected type:", Message.REQUEST_VIBRATION);
      
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
          retryCountRef.current = 0; // 새로운 연결 시도 시 재시도 횟수 리셋
          connectWallet({
            onSuccess: (data) => {
              const address = data.accounts[0];
              pendingConnectRef.current = false;
              retryCountRef.current = 0;
              postMessage({
                type: Message.RESPONSE_SMART_WALLET_CONNECT,
                data: address,
              });
              // address가 할당되어 웹뷰로 전송되면 모달 자동 닫기
              if (isOpen) {
                log("✅ [Native] address 할당 완료, 모달 자동 닫기");
                closeWallet();
              }
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
          log("✅ [Native] REQUEST_VIBRATION received - executing haptic");
          try {
            const vibrationType = data.data?.vibrationType || VibrationType.IMPACT_MEDIUM;
            log("📳 [Native] Vibration type:", vibrationType);
            
            switch (vibrationType) {
              // Impact 피드백
              case VibrationType.IMPACT_LIGHT:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
              case VibrationType.IMPACT_MEDIUM:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
              case VibrationType.IMPACT_HEAVY:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
              case VibrationType.IMPACT_RIGID:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                break;
              case VibrationType.IMPACT_SOFT:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                break;
              
              // Notification 피드백
              case VibrationType.NOTIFICATION_SUCCESS:
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
              case VibrationType.NOTIFICATION_WARNING:
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
              case VibrationType.NOTIFICATION_ERROR:
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
              
              // Selection 피드백
              case VibrationType.SELECTION:
                await Haptics.selectionAsync();
                break;
              
              default:
                // 기본값: Medium impact
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                log("⚠️ [Native] Unknown vibration type, using default (Medium)");
            }
            
            log("✅ [Native] Haptic executed successfully");
          } catch (hapticError) {
            log("❌ [Native] Haptic execution failed:", hapticError);
          }
          break;

        default:
          console.info("MESSAGE from WebView", data);
          break;
      }
    } catch (error) {
      log("❌ [Native] Error processing message:", error);
      console.error("Failed to process WebView message:", error);
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
        onLoadEnd={handleLoadEnd}
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
