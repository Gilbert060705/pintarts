import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ArtDetailScreen from '../screens/ArtDetailScreen';
import ARPreviewScreen from '../screens/ARPreviewScreen';

// Navigators
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: { backgroundColor: '#FFFFFF' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
      <Stack.Screen
        name="ArtDetail"
        component={ArtDetailScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ARPreview"
        component={ARPreviewScreen}
        options={{
          gestureEnabled: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#000000' },
        }}
      />
    </Stack.Navigator>
  );
}
