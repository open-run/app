import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Text, View} from 'react-native';

const App = () => {
  return (
    <NavigationContainer>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Hello World</Text>
      </View>
    </NavigationContainer>
  );
};

export default App;
