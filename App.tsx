import React from 'react';
import {Platform, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from '@screens/HomeScreen';
import DetailScreen from '@screens/DetailScreen';
import AvatarScreen from '@screens/AvatarScreen';
import {WebViewProvider} from '@components/WebViewProvider';
import {RootStackParamList, RouteNames} from './src/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setBarStyle('dark-content');
}

export default function App() {
  return (
    <WebViewProvider>
      <NavigationContainer>
        <SafeAreaProvider>
          <Stack.Navigator>
            <Stack.Screen
              name={RouteNames.HOME}
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name={RouteNames.DETAIL}
              component={DetailScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name={RouteNames.AVATAR}
              component={AvatarScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </SafeAreaProvider>
      </NavigationContainer>
    </WebViewProvider>
  );
}
