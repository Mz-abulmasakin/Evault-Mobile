import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Splash({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('IntroScreen'); // Change "Home" to your screen name
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={require('../assets/evault-logo.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>eVault</Text>

      <Text style={styles.subtitle}>
        Secure • Smart • Simple
      </Text>

      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={{ marginTop: 35 }}
      />

      <Text style={styles.version}>
        Version 1.0.0
      </Text>

    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B63CE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 17,
    color: '#E6F0FF',
  },

  version: {
    position: 'absolute',
    bottom: 40,
    color: '#E6F0FF',
    fontSize: 14,
  },
});