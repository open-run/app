import React, { RefObject, ReactNode, createContext, useCallback, useRef } from "react";
import WebView from "react-native-webview";

interface WebViewContextType {
  webViewRefs: RefObject<WebView[]>;
  addWebView: (webView: WebView) => void;
}

const WebViewContext = createContext<WebViewContextType | undefined>(undefined);

const WebViewProvider = ({ children }: { children: ReactNode }) => {
  const webViewRefs = useRef<WebView[]>([]);
  const addWebView = useCallback((webView: WebView) => {
    webViewRefs.current.push(webView);
  }, []);

  return (
    <WebViewContext.Provider
      value={{
        webViewRefs,
        addWebView,
      }}
    >
      {children}
    </WebViewContext.Provider>
  );
};

export { WebViewProvider, WebViewContext };
