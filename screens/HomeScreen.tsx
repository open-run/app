import React, {useContext} from 'react';
import WebView from 'react-native-webview';
import {WebViewContext} from '../components/WebViewProvider';
import {StatusBar, Platform, View, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');
}

export default function HomeScreen() {
  const context = useContext(WebViewContext);
  return (
    <SafeAreaProvider>
      <View style={styles.safearea}>
        <WebView
          ref={ref => {
            if (ref != null) {
              context?.addWebView(ref);
            }
          }}
          showsVerticalScrollIndicator={false} // 수직 스크롤 바 숨기기
          source={{uri: 'https://open-run.vercel.app/'}}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safearea: {flex: 1}, // 전체 화면으로 만들기
});
