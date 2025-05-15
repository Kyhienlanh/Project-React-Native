import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Screenlogin from './Screens/Screenlogin';
import ScreenRegister from './Screens/ScreenRegister';
import ScreenHome from './Screens/ScreenHome';
import BottomTabNavigator from './Screens/BottomTabNavigator';



const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='loginNote'>
         <Stack.Screen name="BottomTabNavigator"
         component={BottomTabNavigator}
          options={
            {
              headerShown:false
              // header: () => <CustomHeader />
            }
          
          }
         />
        <Stack.Screen name="loginNote" component={Screenlogin} options={ { headerShown:false}}/>
        <Stack.Screen name="RegisterNote" component={ScreenRegister}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
