import React, { useContext, useRef } from "react";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import Layout from "@components/Layout";
import { requestGeolocation } from "@utils/geolocation";
import { Message } from "@constants/message";
import { log } from "@utils/log";
import { URL } from "@constants/index";
import { WebViewContext } from "@components/WebViewProvider";

export default function BungScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialUrl: string }>();
  const webViewRef = useRef<WebView>(null);
  const context = useContext(WebViewContext);

  const postMessage = (message: any) => {
    log("POST MESSAGE TO WEBVIEW", message);
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
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
      <WebView
        ref={(ref) => {
          webViewRef.current = ref;
          if (ref != null) {
            context?.addWebView(ref);
          }
        }}
        source={{ uri: params.initialUrl }}
        webviewDebuggingEnabled
        geolocationEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={onMessage}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url === URL || request.mainDocumentURL === URL) {
            if (context?.webViewRefs.current != null) {
              context.webViewRefs.current.forEach((webView) => {
                webView.reload();
              });
            }

            router.back();
            return false;
          }

          return true;
        }}
      />
    </Layout>
  );
}
