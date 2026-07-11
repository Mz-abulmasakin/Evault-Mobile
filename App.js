import { StatusBar } from 'expo-status-bar';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// --- CUSTOM COMPONENT IMPORTS ---
import Splash from './screens/Splash';
import IntroScreen from './screens/IntroScreen';
import Register from './screens/Register';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';


function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

// Unified Brand Color matching your UserCard component
const USER_CARD_COLOR = '#2a5fd3'; 
const Stack = createNativeStackNavigator();

export default function App() {
  return (
   <NavigationContainer>
      <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false}}>
       <Stack.Screen name="Splash" component={Splash}  />
       <Stack.Screen name="IntroScreen" component={IntroScreen}  />
       <Stack.Screen name="Register" component={Register}  />
         <Stack.Screen name="LoginScreen" component={LoginScreen}  />
         <Stack.Screen name="HomeScreen" component={HomeScreen}  />
         
  </Stack.Navigator>
   </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 16, 
    paddingBottom: 40, 
  },
  headerLogoWrapper: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: USER_CARD_COLOR, // Matches your main card block
    borderRadius: 18,
    shadowColor: USER_CARD_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: 12,
    tintColor: '#ffffff', // Ensures consistency if the asset allows tinting
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  cardContentWrapper: {
    width: '100%', 
    marginBottom: 28,
  },
  textHeroContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a', 
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 20,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    width: '90%',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    padding: 4,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonPressed: {
    backgroundColor: 'rgba(38, 75, 197, 0.08)',
  },
  tabBtnText: {
    color: USER_CARD_COLOR,
    fontSize: 13,
    fontWeight: '700',
  },
  inlineButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '90%', 
    marginVertical: 6,
  },
  premiumTile: {
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: USER_CARD_COLOR, // Filled with the brand identity color
    paddingVertical: 22,     
    marginHorizontal: 6, 
    borderRadius: 20,
    
    // Smooth depth elevation shadow framework
    shadowColor: USER_CARD_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  iconBackdropCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Light glass overlay inside the solid button
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileBtnText: {
    color: '#ffffff', // Shifted to white for crystal clear readability
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  pressimg: {
    height: 26, 
    width: 26,   
    resizeMode: 'contain',
    tintColor: '#ffffff',
  },
});