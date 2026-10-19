// hooks/useSupport.js
import { useState } from 'react';
import { Linking, Alert } from 'react-native';

export function useSupport() {
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [isCopying, setIsCopying] = useState(false);

  // Accordion toggle handler
  const toggleFaq = (id) => {
    setExpandedFaqId((prevId) => (prevId === id ? null : id));
  };

  // Redirect cleanly into WhatsApp native application contexts
  const openWhatsApp = async (phone, defaultText) => {
    const formattedUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(defaultText)}`;
    const webFallbackUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultText)}`;

    try {
      const supported = await Linking.canOpenURL(formattedUrl);
      if (supported) {
        await Linking.openURL(formattedUrl);
      } else {
        // Fallback to web link if WhatsApp isn't installed natively
        await Linking.openURL(webFallbackUrl);
      }
    } catch (error) {
      Alert.alert("Connection Error", "Unable to open your WhatsApp messaging layer.");
    }
  };

  // Handle outside deep linking for brand socials
  const openExternalUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Link Error", "Could not open link in system web environment.");
    }
  };

  // Simulate premium referral copying workflow
  const copyToClipboard = async (code) => {
    setIsCopying(true);
    // In production: await Clipboard.setStringAsync(code);
    setTimeout(() => {
      setIsCopying(false);
      Alert.alert("Copied!", `Referral code "${code}" added to device clipboard.`);
    }, 600);
  };

  return {
    expandedFaqId,
    isCopying,
    toggleFaq,
    openWhatsApp,
    openExternalUrl,
    copyToClipboard
  };
}