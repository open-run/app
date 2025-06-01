import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

export default function Layout({children}: {children: ReactNode}) {
  return <View style={styles.safearea}>{children}</View>;
}

const styles = StyleSheet.create({
  safearea: {flex: 1}, // 전체 화면으로 만들기
});
