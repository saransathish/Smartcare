import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ChatbotMobile from './components/Chatbot';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading screen while checking login status
  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4a90e2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!isLoggedIn ? (
            // Auth stack
            <>
              <Stack.Screen 
                name="Login"
                options={{ title: 'SmartCare Login' }}
              >
                {(props) => <Login {...props} onLogin={handleLogin} />}
              </Stack.Screen>
              <Stack.Screen 
                name="Register" 
                component={Register}
                options={{ title: 'Create Account' }}
              />
            </>
          ) : (
            // Main app stack
            <>
              <Stack.Screen
                name="Home"
                options={{
                  title: 'SmartCare',
                  headerLeft: () => null,
                  gestureEnabled: false,
                }}
              >
                {(props) => <Home {...props} onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen
                name="Chatbot"
                component={ChatbotMobile}
                options={{ title: 'SmartCare Assistant' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;