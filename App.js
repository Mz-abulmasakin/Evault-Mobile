import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, Image 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// --- CUSTOM COMPONENT IMPORTS ---
// Fixed Casing: Changed 'Videocomponents' to 'VideoComponents' to match your filename
import VideoComponents from './components/VideoComponents';

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

// Fixed Path: Changed '../assets/...' to './assets/...' since App.js is in the root directory
const topLogo = require('./assets/evault-logo.png');

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          
          {/* Top Branding Header */}
          <View style={styles.logoContainer}>
            <Image style={styles.headerLogo} source={topLogo} />
          </View>

          {/* Hero Video Section Wrapper */}
          <View style={styles.videoContainer}>
            <VideoComponents />
          </View>
          
          {/* Onboarding Welcome Typography */}
          <Text style={styles.subtitle}>
            Welcome to eVaultMoney Corporate Login. Sign up to learn more.
          </Text>
          
          {/* Primary Action Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton, 
              { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]} 
            onPress={() => showAlert('Soon to be Redirected')}
          >
            <Text style={styles.primaryButtonText}>Proceed</Text>
          </Pressable>

        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
    padding: 12,
    backgroundColor: '#061c5a', 
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLogo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  videoContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#334155', 
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    paddingHorizontal: 12,
    marginBottom: 36,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#264bc5', 
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#264bc5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});