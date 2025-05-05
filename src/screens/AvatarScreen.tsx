import React, {useContext} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import Layout from '@components/Layout';
import {WebViewContext} from '@components/WebViewProvider';
import {URL} from '@constants/index';
import {RootStackParamList} from '../routes';

type Props = NativeStackScreenProps<RootStackParamList, 'avatar'>;

export default function AvatarScreen({route, navigation}: Props) {
  const {initialUrl} = route.params;
  const context = useContext(WebViewContext);

  return (
    <Layout>
      <WebView
        ref={ref => {
          if (ref != null) {
            context?.addWebView(ref);
          }
        }}
        source={{uri: initialUrl}}
        webviewDebuggingEnabled
        geolocationEnabled
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        onShouldStartLoadWithRequest={request => {
          if (request.url === URL || request.mainDocumentURL === URL) {
            if (context?.webViewRefs.current != null) {
              context.webViewRefs.current.forEach(webView => {
                webView.reload();
              });
            }

            navigation.goBack();
            return false;
          }

          return true;
        }}
      />
    </Layout>
  );
}
