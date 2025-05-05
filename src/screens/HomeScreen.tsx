import React, {useRef} from 'react';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Layout from '@components/Layout';
import {requestGeolocation} from '@utils/geolocation';
import {Message} from '@constants/message';
import {URL} from '@constants/index';
import {RootStackParamList, RouteNames} from '../routes';

type Props = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Props>();
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
        ref={webViewRef}
        source={{uri: URL}}
        webviewDebuggingEnabled
        geolocationEnabled
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        onMessage={onMessage}
        onShouldStartLoadWithRequest={request => {
          if (request.url.includes('/bung')) {
            navigation.navigate(RouteNames.DETAIL, {
              initialUrl: request.url,
            });
            return false;
          }

          if (request.url.includes('/avatar')) {
            navigation.navigate(RouteNames.AVATAR, {
              initialUrl: request.url,
            });
            return false;
          }

          return true;
        }}
      />
    </Layout>
  );
}
