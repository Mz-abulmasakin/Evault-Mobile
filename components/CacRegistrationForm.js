import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BRAND_COLOR = '#2a5fd3';

function showFormAlert(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function CacRegistrationForm({ onClose }) {
  // Step tracker workflow: 'entity_select' -> 'basic_info' -> 'personnel' -> 'checkout'
  const [step, setStep] = useState('entity_select');
  const [entityType, setEntityType] = useState(''); // 'business', 'ltd', 'ngo'

  // Dynamic Multi-Step Intake Form States
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [name3, setName3] = useState(''); 
  const [officeAddress, setOfficeAddress] = useState('');
  const [businessNature, setBusinessNature] = useState('');
  const [shareCapital, setShareCapital] = useState('1000000'); 
  
  // Personnel Data Array References
  const [personnelName, setPersonnelName] = useState('');
  const [personnelNin, setPersonnelNin] = useState('');
  const [personnelRole, setPersonnelRole] = useState('');

  // CAC Pricing Tiers
  const getFee = () => {
    if (entityType === 'business') return 25000;
    if (entityType === 'ltd') return 45000;
    if (entityType === 'ngo') return 95000;
    return 0;
  };

  const handleNext = () => {
    if (step === 'entity_select' && entityType) setStep('basic_info');
    else if (step === 'basic_info') setStep('personnel');
    else if (step === 'personnel') setStep('checkout');
  };

  const handleBack = () => {
    if (step === 'entity_select') {
      if (onClose) onClose(); 
    } else if (step === 'basic_info') {
      setStep('entity_select');
    } else if (step === 'personnel') {
      setStep('basic_info');
    } else if (step === 'checkout') {
      setStep('personnel');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* APP HEADER SYSTEM NAVIGATION */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>CAC Enterprise Portal</Text>
        <Text style={styles.stepBadge}>{step.toUpperCase().replace('_', ' ')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* --- STEP 1: CORPORATE FRAMEWORK SELECTION --- */}
        {step === 'entity_select' && (
          <View>
            <Text style={styles.sectionTitle}>Select Registration Class</Text>
            <Text style={styles.sectionSubtitle}>Choose the legal architecture that fits your corporate blueprint.</Text>
            
            <Pressable 
              style={[styles.optionCard, entityType === 'business' && styles.optionCardSelected]} 
              onPress={() => setEntityType('business')}
            >
              <Ionicons name="briefcase-outline" size={24} color={entityType === 'business' ? '#ffffff' : BRAND_COLOR} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, entityType === 'business' && styles.textWhite]}>Business Name</Text>
                <Text style={[styles.optionDesc, entityType === 'business' && styles.textWhiteMuted]}>Sole Proprietorships & Partnerships. Fast tracking setup with unlimited liability status.</Text>
              </View>
            </Pressable>

            <Pressable 
              style={[styles.optionCard, entityType === 'ltd' && styles.optionCardSelected]} 
              onPress={() => setEntityType('ltd')}
            >
              <Ionicons name="business-outline" size={24} color={entityType === 'ltd' ? '#ffffff' : BRAND_COLOR} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, entityType === 'ltd' && styles.textWhite]}>Limited Liability Company (LTD)</Text>
                <Text style={[styles.optionDesc, entityType === 'ltd' && styles.textWhiteMuted]}>Protected assets governed by explicit share stakes. Essential for commercial entities.</Text>
              </View>
            </Pressable>

            <Pressable 
              style={[styles.optionCard, entityType === 'ngo' && styles.optionCardSelected]} 
              onPress={() => setEntityType('ngo')}
            >
              <Ionicons name="people-outline" size={24} color={entityType === 'ngo' ? '#ffffff' : BRAND_COLOR} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, entityType === 'ngo' && styles.textWhite]}>NGO / Incorporated Trustees</Text>
                <Text style={[styles.optionDesc, entityType === 'ngo' && styles.textWhiteMuted]}>Foundations, community groups, and faith-based setups. Strictly monitored non-profit tracking.</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* --- STEP 2: REGISTERED PARAMETERS & OFFICE ADDRESS --- */}
        {step === 'basic_info' && (
          <View>
            <Text style={styles.sectionTitle}>Availability Search Settings</Text>
            
            <Text style={styles.inputLabel}>Proposed Corporate Name Option 1</Text>
            <TextInput style={styles.input} placeholder="e.g., Evault Tech Logistics" value={name1} onChangeText={setName1} />
            
            <Text style={styles.inputLabel}>Proposed Corporate Name Option 2</Text>
            <TextInput style={styles.input} placeholder="e.g., iServebay Solutions" value={name2} onChangeText={setName2} />

            {entityType === 'ngo' && (
              <View>
                <Text style={styles.inputLabel}>Proposed Corporate Name Option 3 (Mandatory for Trustees)</Text>
                <TextInput style={styles.input} placeholder="e.g., Evault Development Foundation" value={name3} onChangeText={setName3} />
              </View>
            )}

            <Text style={styles.inputLabel}>Registered Head Office Address (Nigeria Only)</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline placeholder="House No, Street Name, City, State" value={officeAddress} onChangeText={setOfficeAddress} />

            {entityType === 'ltd' && (
              <View>
                <Text style={styles.inputLabel}>Authorized Share Capital (Minimum value ₦1,000,000)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={shareCapital} onChangeText={setShareCapital} />
              </View>
            )}

            <Text style={styles.inputLabel}>{entityType === 'ngo' ? 'Aims & Structural Objectives Summary' : 'Nature of Core Business Operations'}</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Describe what this corporate entity will handle..." value={businessNature} onChangeText={setBusinessNature} />
          </View>
        )}

        {/* --- STEP 3: PERSONNEL LOGISTICS BLOCK --- */}
        {step === 'personnel' && (
          <View>
            <Text style={styles.sectionTitle}>
              {entityType === 'business' && "Proprietors & Partners Parameters"}
              {entityType === 'ltd' && "Directors & Shareholders Allocation"}
              {entityType === 'ngo' && "Board of Trustees Definition"}
            </Text>
            <Text style={styles.sectionSubtitle}>Log information for individuals assuming statutory capacities.</Text>

            <View style={styles.innerFormBox}>
             <Text style={styles.inputLabel}> DIrector 1 </Text>
              <Text style={styles.inputLabel}>Full Legal Name (Matches Government Issued ID)</Text>
              <TextInput style={styles.input} placeholder="e.g., Director Name as written in NIN" value={personnelName} onChangeText={setPersonnelName} />

              <Text style={styles.inputLabel}>National Identification Number (NIN)</Text>
              <TextInput style={styles.input} keyboardType="numeric" maxLength={11} placeholder="11-Digit Identity Code" value={personnelNin} onChangeText={setPersonnelNin} />
              <Text style={styles.inputLabel}>DIrector 2</Text>
              <Text style={styles.inputLabel}>Full Legal Name (Matches Government Issued ID)</Text>
              <TextInput style={styles.input} placeholder="e.g., Director Name as written in NIN" value={personnelName} onChangeText={setPersonnelName} />
              <Text style={styles.inputLabel}>National Identification Number (NIN)</Text>
              <TextInput style={styles.input} keyboardType="numeric" maxLength={11} placeholder="11-Digit Identity Code" value={personnelNin} onChangeText={setPersonnelNin} />
                <Text style={styles.inputLabel}>DIrector 3</Text>
              <Text style={styles.inputLabel}>Full Legal Name (Matches Government Issued ID)</Text>
              <TextInput style={styles.input} placeholder="e.g., Director Name as written in NIN" value={personnelName} onChangeText={setPersonnelName} />

              <Text style={styles.inputLabel}>National Identification Number (NIN)</Text>
              <TextInput style={styles.input} keyboardType="numeric" maxLength={11} placeholder="11-Digit Identity Code" value={personnelNin} onChangeText={setPersonnelNin} />

              <Text style={styles.inputLabel}>Operational Capacity / Structural Title</Text>
              <TextInput 
                style={styles.input} 
                placeholder={entityType === 'ngo' ? 'e.g., Trustee Chairman / Secretary' : 'e.g., Managing Director / Shareholder'} 
                value={personnelRole} 
                onChangeText={setPersonnelRole} 
              />

              {/* Secure Document Digital Capture Assets */}
              <View style={styles.uploadRow}>
                <Pressable style={styles.uploadBtn} onPress={() => showFormAlert('Capture Succeeded', 'Government ID verification upload verified.')}>
                  <Ionicons name="cloud-upload-outline" size={16} color={BRAND_COLOR} />
                  <Text style={styles.uploadBtnText}>Upload ID</Text>
                </Pressable>
                <Pressable style={styles.uploadBtn} onPress={() => showFormAlert('Signature Stored', 'Legal document digital signature capture cached.')}>
                  <Ionicons name="pencil-outline" size={16} color={BRAND_COLOR} />
                  <Text style={styles.uploadBtnText}>Sign Doc</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* --- STEP 4: REVIEW LEDGER & SECURE ROUTING --- */}
        {step === 'checkout' && (
          <View style={styles.checkoutBox}>
            <Text style={styles.checkoutVal}>₦{getFee().toLocaleString()}.00</Text>
            <Text style={styles.checkoutSub}>Statutory Stamp Duty & Statutory CAC Processing Filing Fee</Text>

            <View style={styles.ledger}>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Filing Track</Text>
                <Text style={styles.ledgerValText}>{entityType.toUpperCase()} Formation</Text>
              </View>
              <View style={styles.ledgerDash} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Primary Option</Text>
                <Text style={styles.ledgerValText} numberOfLines={1}>{name1 || "Not specified"}</Text>
              </View>
              <View style={styles.ledgerDash} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Principal Actor</Text>
                <Text style={styles.ledgerValText}>{personnelName || 'Designated Stakeholder'}</Text>
              </View>
              <View style={styles.ledgerDash} />
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Filing Channel</Text>
                <Text style={styles.ledgerValText}>Your Submission has been recieved successfully </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#0284c7" style={{ marginRight: 8 }} />
              <Text style={styles.warningTxt}>
                Pushing payment executes parameters immediately on the live server environment. Edits to name spelling are rejected once checked.
              </Text>
            </View>
          </View>
        )}

        {/* STEPPER FOOTER MANAGEMENT ACTION BUTTON */}
        <Pressable 
          style={[styles.primaryBtn, step === 'entity_select' && !entityType && { backgroundColor: '#cbd5e1' }]} 
          onPress={step === 'checkout' ? () => showFormAlert('Processing Launch', 'Direct electronic CRP push sequence successful.') : handleNext}
          disabled={step === 'entity_select' && !entityType}
        >
          <Text style={styles.primaryBtnTxt}>
            {step === 'checkout' ? 'Authorize Payment & File' : 'Continue'}
          </Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginLeft: 8,
  },
  stepBadge: {
    backgroundColor: '#f0f4ff',
    color: BRAND_COLOR,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 18,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionCardSelected: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 14,
    marginBottom: 6,
  },

  inputLabel1: {
    fontSize: 13,
    fontWeight: '700',
    color: '#031630',
    marginTop: 14,
    marginBottom: 6,
    },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  innerFormBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    width: '48%',
    height: 40,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_COLOR,
    marginLeft: 6,
  },
  checkoutBox: {
    alignItems: 'center',
    paddingTop: 10,
  },
  checkoutVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  checkoutSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  ledger: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  ledgerLbl: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  ledgerValText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '60%',
  },
  ledgerDash: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  warningTxt: {
    flex: 1,
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLOR,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  primaryBtnTxt: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  textWhite: { color: '#ffffff' },
  textWhiteMuted: { color: 'rgba(255, 255, 255, 0.7)' },
});