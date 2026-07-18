// SupportScreen.jsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSupport } from '../hooks/useSupport';
import { ReferralCard } from '../components/ReferralCard';
import { FaqCard } from '../components/FaqCard';
import { FAQ_DATA, SOCIAL_PROFILES, WHATSAPP_CONFIG } from '../data/supportData';

const BRAND_COLOR = '#2a5fd3';

export default function SupportScreen() {
  const {
    expandedFaqId,
    isCopying,
    toggleFaq,
    openWhatsApp,
    openExternalUrl,
    copyToClipboard
  } = useSupport();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <Text style={styles.screenHeader}>Support Center</Text>

        {/* 1. Referral Action System */}
        <ReferralCard 
          referralCode="EVAULT50K" 
          onCopy={copyToClipboard}
          isCopying={isCopying}
        />

        {/* 2. Instant WhatsApp Communication Panel */}
        <Text style={styles.sectionTitle}>DIRECT SUPPORT desk</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity 
            style={styles.whatsAppActionRow}
            onPress={() => openWhatsApp(WHATSAPP_CONFIG.phoneNumber, WHATSAPP_CONFIG.defaultMessage)}
          >
            <View style={styles.leftLabelSlot}>
              <Text style={styles.whatsAppTitle}>Message Instant Helpdesk</Text>
              <Text style={styles.whatsAppSub}>Typically replies within 5 minutes</Text>
            </View>
            <Text style={styles.whatsAppBadge}>WhatsApp Secure</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Dynamic Interactive FAQ Loop */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.groupCard}>
          {FAQ_DATA.map((faq) => (
            <FaqCard
              key={faq.id}
              item={faq}
              isExpanded={expandedFaqId === faq.id}
              onToggle={() => toggleFaq(faq.id)}
            />
          ))}
        </View>

        {/* 4. Social Community Channels */}
        <Text style={styles.sectionTitle}>JOIN OUR COMMUNITY</Text>
        <View style={styles.groupCard}>
          {SOCIAL_PROFILES.map((social) => (
            <TouchableOpacity 
              key={social.id}
              style={styles.socialRow}
              onPress={() => openExternalUrl(social.url)}
            >
              <Text style={styles.socialPlatform}>{social.platform}</Text>
              <Text style={styles.socialHandle}>{social.handle} ›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  screenHeader: { fontSize: 24, fontWeight: '700', color: '#0F172A', paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 28, marginBottom: 8 },
  groupCard: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  
  // WhatsApp Custom Styles
  whatsAppActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  leftLabelSlot: { flex: 1 },
  whatsAppTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  whatsAppSub: { fontSize: 13, color: '#64748B', marginTop: 4 },
  whatsAppBadge: { backgroundColor: '#E6F4EA', color: '#137333', fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },

  // Social Custom Styles
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  socialPlatform: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  socialHandle: { fontSize: 14, color: BRAND_COLOR, fontWeight: '600' }
});