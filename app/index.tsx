import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { useSmartWallet } from "@hooks/useSmartWallet";
import { useWalletConnection } from "@hooks/useWalletConnection";
import { useWebViewMessage } from "@hooks/useWebViewMessage";
import { useWebViewInsets } from "@hooks/useWebViewInsets";
import { URL } from "@constants/index";
import { log } from "@utils/log";

export default function HomeScreen() {
  const { disconnectWallet } = useSmartWallet();
  const webViewRef = useRef<WebView>(null);

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

  return (
    <View style={styles.safearea}>
      <WebView
        ref={webViewRef}
        source={{ uri: URL }}
        geolocationEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={handleMessage}
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
