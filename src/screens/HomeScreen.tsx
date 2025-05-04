import React, {useRef} from 'react';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {StatusBar, Platform, View, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {requestGeolocation} from '../utils/geolocation';
import {Message} from '../constants/message';

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');
}

// const HomeURL = 'https://open-run.vercel.app/';
const DevURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/'
    : 'http://localhost:3000/';

export default function HomeScreen() {
  // const context = useContext(WebViewContext);
  const webViewRef = useRef<WebView>(null);

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('ryong', data);
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
    <SafeAreaProvider>
      <View style={styles.safearea}>
        <WebView
          ref={webViewRef}
          source={{uri: DevURL}}
          webviewDebuggingEnabled
          geolocationEnabled
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          onMessage={onMessage}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safearea: {flex: 1}, // 전체 화면으로 만들기
});
