import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, Pressable, 
  ScrollView, KeyboardAvoidingView, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND_COLOR = '#2a5fd3';

const NETWORKS = [
  { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#000000' },
  { id: 'airtel', name: 'Airtel', color: '#E50914', textColor: '#ffffff' },
  { id: 'glo', name: 'Glo', color: '#2E7D32', textColor: '#ffffff' },
  { id: '9mobile', name: '9mobile', color: '#005743', textColor: '#ffffff' },
];

// OPay-style popular mobile data bundles in Nigeria
const DATA_BUNDLES = [
  { id: 'b1', size: '1.5GB', validity: '30 Days', price: 1200 },
  { id: 'b2', size: '2GB', validity: '1 Day', price: 350 },
  { id: 'b3', size: '3GB', validity: '30 Days', price: 1600 },
  { id: 'b4', size: '4.5GB', validity: '30 Days', price: 2200 },
  { id: 'b5', size: '10GB', validity: '30 Days', price: 3300 },
  { id: 'b6', size: '25GB', validity: '30 Days', price: 6500 },
];

export default function DataPurchaseModal({ visible, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  
  // Controls multi-step workflow: 'form' -> 'checkout' -> 'success'
  const [currentStep, setCurrentStep] = useState('form'); 

  const handleClose = () => {
    setPhoneNumber('');
    setSelectedNetwork(null);
    setSelectedBundle(null);
    setCurrentStep('form');
    onClose();
  };

  // Step 1: Form Validation -> Move to Checkout Review
  const handleProceedToCheckout = () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      alert('Please enter a valid phone number');
      return;
    }
    if (!selectedNetwork) {
      alert('Please select a network provider');
      return;
    }
    if (!selectedBundle) {
      alert('Please select a data bundle plan');
      return;
    }

    setCurrentStep('checkout');
  };

  // Step 2: Confirm Checkout -> Process Success
  const handleConfirmPayment = () => {
    // Process backend payment request here if necessary
    setCurrentStep('success');
  };

  // Get dynamic header titles based on step
  const getHeaderTitle = () => {
    if (currentStep === 'checkout') return 'Review Order';
    if (currentStep === 'success') return 'Receipt';
    return 'Buy Data Bundle';
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          
          {/* HEADER SECTION */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {currentStep === 'checkout' && (
                <Pressable onPress={() => setCurrentStep('form')} style={{ marginRight: 12 }}>
                  <Ionicons name="arrow-back" size={22} color="#0f172a" />
                </Pressable>
              )}
              <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={26} color="#94a3b8" />
            </Pressable>
          </View>

          {/* --- FLOW 1: DATA ENTRY FORM --- */}
          {currentStep === 'form' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              
              {/* Phone Number Input */}
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="0801 234 5678"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <Ionicons name="book-outline" size={22} color={BRAND_COLOR} style={{ marginRight: 12 }} />
              </View>

              {/* Network Provider Selector */}
              <Text style={styles.inputLabel}>Select Network</Text>
              <View style={styles.networkRow}>
                {NETWORKS.map((network) => {
                  const isSelected = selectedNetwork?.id === network.id;
                  return (
                    <Pressable
                      key={network.id}
                      style={[
                        styles.networkCard,
                        isSelected && { borderColor: BRAND_COLOR, backgroundColor: '#f0f4ff', borderWidth: 2 }
                      ]}
                      onPress={() => setSelectedNetwork(network)}
                    >
                      <View style={[styles.networkBadge, { backgroundColor: network.color }]}>
                        <Text style={[styles.networkBadgeText, { color: network.textColor }]}>
                          {network.name[0]}
                        </Text>
                      </View>
                      <Text style={styles.networkName}>{network.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Data Bundle Plan Selector Grid */}
              <Text style={styles.inputLabel}>Select Data Plan</Text>
              <View style={styles.bundleGrid}>
                {DATA_BUNDLES.map((bundle) => {
                  const isSelected = selectedBundle?.id === bundle.id;
                  return (
                    <Pressable
                      key={bundle.id}
                      style={[
                        styles.bundleTile,
                        isSelected && styles.bundleTileSelected
                      ]}
                      onPress={() => setSelectedBundle(bundle)}
                    >
                      <Text style={[styles.bundleSize, isSelected && styles.textWhite]}>
                        {bundle.size}
                      </Text>
                      <Text style={[styles.bundleValidity, isSelected && styles.textWhiteMuted]}>
                        {bundle.validity}
                      </Text>
                      <Text style={[styles.bundlePrice, isSelected && styles.textWhite]}>
                        ₦{bundle.price.toLocaleString()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Action Button */}
              <Pressable style={styles.actionButton} onPress={handleProceedToCheckout}>
                <Text style={styles.actionButtonText}>
                  Continue to Review
                </Text>
              </Pressable>

            </ScrollView>
          )}

          {/* --- FLOW 2: CHECKOUT ORDER REVIEW --- */}
          {currentStep === 'checkout' && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.checkoutScrollContainer}
            >
              <Text style={styles.checkoutPaymentValue}>
                ₦{Number(selectedBundle?.price || 0).toLocaleString()}.00
              </Text>
              <Text style={styles.checkoutPaymentLabel}>Total Payable Amount</Text>

              <View style={styles.checkoutSummaryCard}>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Service / Package</Text>
                  <Text style={styles.ledgerValueBold}>{selectedNetwork?.name} Data Bundle</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Plan Details</Text>
                  <Text style={styles.ledgerValue}>{selectedBundle?.size} ({selectedBundle?.validity})</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Phone Number</Text>
                  <Text style={styles.ledgerValue}>{phoneNumber}</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Payment Method</Text>
                  <Text style={styles.ledgerValue}>Wallet Balance</Text>
                </View>
              </View>

              <View style={styles.checkoutNoteBox}>
                <Ionicons name="information-circle-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.checkoutNoteText}>
                  Please confirm the recipient number. Completed data transactions cannot be recalled.
                </Text>
              </View>

              <View style={styles.checkoutActions}>
                <Pressable style={styles.actionButton} onPress={handleConfirmPayment}>
                  <Text style={styles.actionButtonText}>Confirm & Pay Now</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

          {/* --- FLOW 3: TRANSACTION SUCCESS RECEIPT --- */}
          {currentStep === 'success' && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.successScrollContainer}
            >
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
              </View>

              <Text style={styles.successTitle}>Transaction Successful</Text>
              <Text style={styles.successSubtitle}>The data plan subscription has been processed successfully.</Text>

              {/* Receipt Ledger Information */}
              <View style={styles.receiptLedger}>
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Data Package</Text>
                  <Text style={styles.ledgerValueBold}>{selectedBundle?.size} ({selectedBundle?.validity})</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Amount Charged</Text>
                  <Text style={styles.ledgerValue}>₦{Number(selectedBundle?.price).toLocaleString()}.00</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Recipient Number</Text>
                  <Text style={styles.ledgerValue}>{phoneNumber}</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Network</Text>
                  <Text style={styles.ledgerValue}>{selectedNetwork?.name}</Text>
                </View>
                <View style={styles.ledgerDivider} />
                <View style={styles.ledgerRow}>
                  <Text style={styles.ledgerLabel}>Status</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
              </View>

              {/* Lower Actions Container */}
              <View style={styles.successActions}>
                <Pressable style={styles.actionButton} onPress={handleClose}>
                  <Text style={styles.actionButtonText}>Done</Text>
                </Pressable>
                <Pressable style={styles.shareBtn} onPress={() => alert('Receipt shared successfully')}>
                  <Ionicons name="share-social-outline" size={18} color={BRAND_COLOR} style={{ marginRight: 6 }} />
                  <Text style={styles.shareBtnText}>Share Receipt</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    padding: 2,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    height: 52,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  networkCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  networkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  networkBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  networkName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  bundleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  bundleTile: {
    width: '48%', 
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  bundleTileSelected: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  bundleSize: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  bundleValidity: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  bundlePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND_COLOR,
  },
  textWhite: {
    color: '#ffffff',
  },
  textWhiteMuted: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  /* CHECKOUT STYLING */
  checkoutScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  checkoutPaymentValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  checkoutPaymentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 24,
  },
  checkoutSummaryCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkoutNoteBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  checkoutNoteText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    lineHeight: 16,
  },
  checkoutActions: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 16,
  },

  /* RECEIPT OVERLAYS */
  successScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  successIconWrapper: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  receiptLedger: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    width: '100%',
    padding: 20,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ledgerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  ledgerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  ledgerValueBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  ledgerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  statusPill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '700',
  },
  successActions: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 8,
  },
  shareBtnText: {
    color: BRAND_COLOR,
    fontSize: 14,
    fontWeight: '700',
  },
});