import React, { useContext, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import Layout from "@components/Layout";
import { requestGeolocation } from "@utils/geolocation";
import { Message } from "@constants/message";
import { URL } from "@constants/index";
import { log } from "@utils/log";
import { useSmartWallet } from "@hooks/useSmartWallet";
import { WebViewContext } from "@components/WebViewProvider";

export default function HomeScreen() {
  const context = useContext(WebViewContext);
  const { address, connectWallet, disconnectWallet } = useSmartWallet();
  const webViewRef = useRef<WebView>(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  const postMessage = (message: any) => {
    log("POST MESSAGE TO WEBVIEW", message);
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

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

        connectWallet({
          onSuccess: (data) => {
            const address = data.accounts[0];
            postMessage({
              type: Message.RESPONSE_SMART_WALLET_CONNECT,
              data: address,
            });
          },
          onError: (error) => {
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
    <Layout>
      {!isWebViewLoaded && (
        <View style={styles.splashContainer}>
          <ActivityIndicator size="large" color="#4A5CEF" />
        </View>
      )}
      <WebView
        ref={(ref) => {
          webViewRef.current = ref;
          if (ref != null) {
            context?.addWebView(ref);
          }
        }}
        source={{ uri: URL }}
        webviewDebuggingEnabled
        geolocationEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={onMessage}
        onLoadEnd={() => {
          setIsWebViewLoaded(true);
        }}
        allowsBackForwardNavigationGestures={true}
        bounces={false}
        overScrollMode="never"
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
