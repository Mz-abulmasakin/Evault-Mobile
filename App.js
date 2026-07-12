import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { Ionicons } from '@expo/vector-icons'; 
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- CLEAN FILE IMPORTS ---
import Splash from './screens/Splash';
import IntroScreen from './screens/IntroScreen';
import Register from './screens/Register';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ServicesScreen from './screens/ServicesScreen'; 
import SupportScreen from './screens/SupportScreen';   
import AccountScreen from './screens/AccountScreen';   

const BRAND_COLOR = '#2a5fd3'; 
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- BOTTOM NAVIGATION WITH PROTECTED PADDING ---
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true, 
        tabBarHideOnKeyboard: true, 
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingTop: 10,
          
          // FIX: Increased bottom padding for Android to force everything upward
          paddingBottom: Platform.OS === 'ios' ? 28 : 20, 
          
          // FIX: Set a dedicated safe height so elements don't squash into the navigation keys
          height: Platform.OS === 'ios' ? 96 : 80, 
          
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          // FIX: Adds a slight bottom lift specifically on Android devices
          marginBottom: Platform.OS === 'android' ? 2 : 0, 
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Support') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

// --- MASTER NAVIGATION TREE ---
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="IntroScreen" component={IntroScreen} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}