
// App.js

import React, { useEffect } from "react";

import { Ionicons } from "@expo/vector-icons";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  StatusBar,
} from "expo-status-bar";

import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

// =====================================================
// BACKEND WARM-UP
// =====================================================

import {
  warmUpBackend,
} from "./services/backendwarmup";

// =====================================================
// SCREENS
// =====================================================

import HomeScreen from "./screens/HomeScreen";
import IntroScreen from "./screens/IntroScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Register from "./screens/Register";
import ServicesScreen from "./screens/ServicesScreen";
import Splash from "./screens/Splash";
import StatutoryHistoryScreen from "./screens/StatutoryHistoryScreen";
import SupportScreen from "./screens/SupportScreen";
import TinRegistration from "./screens/TinRegistration";
import WorksScreen from "./screens/WorksScreen";

// =====================================================
// BRAND
// =====================================================

const BRAND_COLOR = "#2A5FD3";
const BRAND_TINT = "#EAF1FF";
const INACTIVE_COLOR = "#8994A7";
const BACKGROUND_COLOR = "#F7F9FC";

// =====================================================
// NAVIGATORS
// =====================================================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// =====================================================
// TAB ICONS
// =====================================================

function getTabIcon(routeName, focused) {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";

    case "Services":
      return focused ? "grid" : "grid-outline";

    case "Support":
      return focused
        ? "chatbubbles"
        : "chatbubbles-outline";

    case "Account":
      return focused
        ? "person"
        : "person-outline";

    default:
      return "ellipse-outline";
  }
}

// =====================================================
// BOTTOM TAB NAVIGATION
// =====================================================

function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom;

  const baseTabBarHeight =
    Platform.OS === "ios" ? 60 : 64;

  const effectiveBottomPadding =
    bottomInset > 0 ? bottomInset : 8;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        // ACTIVE / INACTIVE COLORS

        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        tabBarHideOnKeyboard: true,

        // BOTTOM BAR APPEARANCE

        tabBarStyle: {
          backgroundColor: "#FFFFFF",

          borderTopWidth: 0,

          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,

          height: baseTabBarHeight + bottomInset,

          paddingTop: 7,
          paddingBottom: effectiveBottomPadding,

          elevation: 15,

          shadowColor: "#16233B",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,

          borderColor: "transparent",
        },

        // LABEL APPEARANCE

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.1,
          marginTop: 3,
          marginBottom: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 1,
        },

        tabBarShowLabel: true,
        tabBarLabelPosition: "below-icon",

        // ICON WITH ACTIVE BACKGROUND

        tabBarIcon: ({ focused, color }) => (
          <View
            style={[
              styles.tabIconContainer,
              focused && styles.tabIconContainerActive,
            ]}
          >
            <Ionicons
              name={getTabIcon(route.name, focused)}
              size={22}
              color={color}
            />
          </View>
        ),

        // SCREEN BACKGROUND

        sceneStyle: {
          backgroundColor: BACKGROUND_COLOR,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home tab",
        }}
      />

      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: "Services",
          tabBarAccessibilityLabel: "Services tab",
        }}
      />

      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: "Support",
          tabBarAccessibilityLabel: "Support tab",
        }}
      />

      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          title: "Account",
          tabBarAccessibilityLabel: "Account tab",
        }}
      />
    </Tab.Navigator>
  );
}

// =====================================================
// ROOT NAVIGATION
// =====================================================

function RootNavigation() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={BRAND_COLOR}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: BACKGROUND_COLOR,
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={Splash}
        />

        <Stack.Screen
          name="IntroScreen"
          component={IntroScreen}
        />

        <Stack.Screen
          name="Register"
          component={Register}
        />

        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
        />

        {/* MAIN APP WITH BOTTOM TABS */}

        <Stack.Screen
          name="HomeScreen"
          component={MainTabNavigator}
        />

        {/* ADDITIONAL SCREENS */}

        <Stack.Screen
          name="TinRegistration"
          component={TinRegistration}
        />

        <Stack.Screen
          name="WorksScreen"
          component={WorksScreen}
        />

        <Stack.Screen
          name="StatutoryHistoryScreen"
          component={StatutoryHistoryScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// =====================================================
// APP ENTRY POINT
// =====================================================

export default function App() {
  // Wake the backend as soon as the app mounts.
  // Do not block authentication or navigation while it loads.
  useEffect(() => {
    warmUpBackend();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>

      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  tabIconContainer: {
    width: 42,
    height: 29,
    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "transparent",
  },

  tabIconContainerActive: {
    backgroundColor: BRAND_TINT,
  },
});
