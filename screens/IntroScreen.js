import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, Image 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// --- CUSTOM COMPONENT IMPORTS ---
import Videocomponents from '../components/VideoComponents';

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

const topLogo = require('../assets/evault-logo.png');

export default function App({navigation}) {
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
            <Videocomponents />
          </View>
          
          {/* Onboarding Welcome Typography */}
          <Text style={styles.subtitle}>
            Welcome to eVault Corporate Sign in , Sign up to learn more.
          </Text>
          
          {/* Primary Action Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton, 
              { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]} 
            onPress={() => navigation.navigate('LoginScreen')}
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
    backgroundColor: '#ffffff', // Clean crisp white presentation background
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 50,
    padding: 12,
    backgroundColor: '#264bc5', // Deep branding backdrop accent
    borderRadius: 20,
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
    color: '#334155', // High-contrast readable slate text color
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    paddingHorizontal: 12,
    marginBottom: 36,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#264bc5', // Prominent fintech signature interaction color
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