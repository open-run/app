import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import {WebViewContext} from '@components/WebViewProvider';
import {URL} from '@constants/index';
import {RootStackParamList} from '../routes';

type Props = NativeStackScreenProps<RootStackParamList, 'avatar'>;

export default function AvatarScreen({route, navigation}: Props) {
  const {initialUrl} = route.params;
  const context = useContext(WebViewContext);

  return (
    <View style={styles.safearea}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  safearea: {flex: 1}, // 전체 화면으로 만들기
});
