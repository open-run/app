import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";
import { useSmartWallet } from "@hooks/useSmartWallet";
import { useWalletConnection } from "@hooks/useWalletConnection";
import { useWebViewMessage } from "@hooks/useWebViewMessage";
import { useWebViewInsets } from "@hooks/useWebViewInsets";
import { URL as WEB_APP_URL } from "@constants/index";
import { log } from "@utils/log";

export default function HomeScreen() {
  const { disconnectWallet } = useSmartWallet();
  const webViewRef = useRef<WebView>(null);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const postMessage = (message: any) => {
    log("POST MESSAGE TO WEBVIEW", message);
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  const { address, handleConnectRequest } = useWalletConnection({ postMessage });
  const { handleMessage } = useWebViewMessage({
    address,
    disconnectWallet,
    handleConnectRequest,
    postMessage,
  });
  const { handleLoadEnd } = useWebViewInsets({ postMessage });

  const reloadWebView = useCallback(() => {
    setWebViewError(null);
    webViewRef.current?.reload();
  }, []);

  const onWebViewLoadEnd = useCallback(
    () => {
      setWebViewError(null);
      handleLoadEnd();
    },
    [handleLoadEnd]
  );

  const onNavigationStateChange = useCallback((navigationState: { url?: string }) => {
    log("WEBVIEW_NAVIGATION_URL", navigationState?.url);
  }, []);

  const onWebViewError = useCallback(
    (event: any) => {
      const description = event?.nativeEvent?.description ?? "알 수 없는 네트워크 에러";
      const failingUrl = event?.nativeEvent?.url ?? WEB_APP_URL;
      const message = `로드 실패: ${description} (${failingUrl})`;
      setWebViewError(message);
      log("WEBVIEW_LOAD_ERROR", event?.nativeEvent);
    },
    []
  );

  const onWebViewHttpError = useCallback((event: any) => {
    const statusCode = event?.nativeEvent?.statusCode;
    const failingUrl = event?.nativeEvent?.url ?? WEB_APP_URL;
    const message = `HTTP ${statusCode ?? "?"} 에러 (${failingUrl})`;
    setWebViewError(message);
    log("WEBVIEW_HTTP_ERROR", event?.nativeEvent);
  }, []);

  return (
    <View style={styles.safearea}>
      <WebView
        key={WEB_APP_URL}
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        geolocationEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={handleMessage}
        onLoadEnd={onWebViewLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        onError={onWebViewError}
        onHttpError={onWebViewHttpError}
        startInLoadingState
        renderLoading={() => <></>}
        allowsBackForwardNavigationGestures
        bounces={false}
        overScrollMode="never"
        allowsLinkPreview={false}
        webviewDebuggingEnabled={__DEV__}
      />

      {webViewError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerTitle}>WebView 연결 오류</Text>
          <Text style={styles.errorBannerText} numberOfLines={2}>
            {webViewError}
          </Text>
          <Pressable style={styles.recoverButton} onPress={reloadWebView}>
            <Text style={styles.recoverButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  errorBanner: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 96,
    zIndex: 25,
    backgroundColor: "rgba(127, 29, 29, 0.94)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  errorBannerTitle: {
    color: "#FEE2E2",
    fontSize: 13,
    fontWeight: "700",
  },
  errorBannerText: {
    color: "#FECACA",
    fontSize: 12,
    lineHeight: 16,
  },
  recoverButton: {
    marginTop: 2,
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recoverButtonText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "700",
  },
});
