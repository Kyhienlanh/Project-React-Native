  import { StyleSheet, Text, View } from 'react-native';
  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import Screenlogin from './Screens/Screenlogin';
  import ScreenRegister from './Screens/ScreenRegister';
  import BottomTabNavigator from './Screens/BottomTabNavigator';
  import CategoryScreen from './Screens/CategoryScreen';
  import ScreenAddcate from './Screens/ScreenAddcate';
  import ScreenchooseIcon from './Screens/ScreenchooseIcon';
  import ScreendetailTransactions from './Screens/ScreendetailTransactions';
  import ScreenChart from './Screens/ScreenChart';
  import ScreenTransactions from './Screens/ScreenTransactions';
  import ScreenCreateBudget from './Screens/ScreenCreateBudget';
  import { ThemeProvider } from './Screens/ThemeContext'
import ScreenforgotPassword from './Screens/ScreenforgotPassword';

import ScreenSettings from './Screens/ScreenSettings';
import ScreenInfo from './Screens/ScreenInfo';
import ScreenAllTrans from './Screens/ScreenAllTrans';
import ScreenMess from './Screens/ScreenMess';


  const Stack = createNativeStackNavigator<RootStackParamList>();

  const App = () => {
    return (
      <ThemeProvider>
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
          <Stack.Screen name="category" component={CategoryScreen}/>
          <Stack.Screen name="addcategory" component={ScreenAddcate}/>
          <Stack.Screen name="chooseIcon" component={ScreenchooseIcon}/>
          <Stack.Screen name="detailTransactions" component={ScreendetailTransactions}/>
          <Stack.Screen name="Chart" component={ScreenChart}/>
          <Stack.Screen name="info" component={ScreenInfo}/>
          <Stack.Screen name="Transactions" component={ScreenTransactions}/>
          <Stack.Screen name="CreateBudget" component={ScreenCreateBudget}/>
          <Stack.Screen name="forgotPassword" component={ScreenforgotPassword}/>
          <Stack.Screen name="AllTrans" component={ScreenAllTrans}/>
           <Stack.Screen name="Mess" component={ScreenMess}/>
        
        </Stack.Navigator>
      </NavigationContainer>
      </ThemeProvider>
      
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
