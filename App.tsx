import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList, RouteNames} from './routes';
import HomeScreen from './screens/HomeScreen';
import {WebViewProvider} from './components/WebViewProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <WebViewProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name={RouteNames.HOME}
            component={HomeScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WebViewProvider>
  );
}
