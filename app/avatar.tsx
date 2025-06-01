import React, { useContext, useRef } from "react";
import WebView from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import Layout from "@components/Layout";
import { URL } from "@constants/index";
import { WebViewContext } from "@components/WebViewProvider";

export default function AvatarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initialUrl: string }>();
  const webViewRef = useRef<WebView>(null);
  const context = useContext(WebViewContext);

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
        originWhitelist={["*"]}
        mixedContentMode="always"
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
