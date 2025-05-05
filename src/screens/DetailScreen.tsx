import React, {useContext, useRef} from 'react';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Layout from '@components/Layout';
import {WebViewContext} from '@components/WebViewProvider';
import {requestGeolocation} from '@utils/geolocation';
import {Message} from '@constants/message';
import {URL} from '@constants/index';
import {RootStackParamList} from '../routes';

type Props = NativeStackScreenProps<RootStackParamList, 'detail'>;

export default function DetailScreen({route, navigation}: Props) {
  const {initialUrl} = route.params;
  const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView>(null);

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === Message.REQUEST_GEOLOCATION) {
      const location = await requestGeolocation();
      console.log('GEOLOCATION', location);
      if (location) {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: Message.GEOLOCATION,
            data: location,
          }),
        );
      } else {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: Message.GEOLOCATION_ERROR,
            message: '위치 정보를 가져올 수 없습니다.',
          }),
        );
      }
    } else {
      // 기타 메시지 처리
      console.info('MESSAGE from WebView', data);
    }
  };

  return (
    <Layout>
      <WebView
        ref={ref => {
          (webViewRef as React.MutableRefObject<WebView | null>).current = ref;
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
        onMessage={onMessage}
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
