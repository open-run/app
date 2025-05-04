import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList, RouteNames} from './routes';
import {WebViewProvider} from './src/components/WebViewProvider';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Platform, StatusBar} from 'react-native';

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
