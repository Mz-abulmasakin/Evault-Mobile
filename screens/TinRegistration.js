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
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Fixed: Import from React Navigation instead of react
import { Ionicons } from '@expo/vector-icons';

const BRAND_COLOR = '#23197e'; 

function showFormAlert(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function TinRegistration({ onClose, onSuccess }) {
  // Step workflow: 'taxpayer_select' -> 'basic_info' -> 'documents' -> 'review_submit'
  const [step, setStep] = useState('taxpayer_select');
  const navigation = useNavigation(); // Fixed: Removed the empty string argument
  const [taxpayerType, setTaxpayerType] = useState(''); // 'corporate' or 'individual'

  // Input States
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [cacNumber, setCacNumber] = useState(''); 
  const [ninNumber, setNinNumber] = useState(''); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // File Upload States
  const [uploadedCac, setUploadedCac] = useState(false);
  const [uploadedUtility, setUploadedUtility] = useState(false);
  const [uploadedId, setUploadedId] = useState(false);
  const [uploadedMemart, setUploadedMemart] = useState(false);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNext = () => {
    if (step === 'taxpayer_select') {
      if (taxpayerType) {
        setStep('basic_info');
      } else {
        showFormAlert('Selection Required', 'Please select a taxpayer class to proceed.');
      }
    } else if (step === 'basic_info') {
      if (taxpayerType === 'corporate') {
        if (!companyName || !cacNumber || !email || !phone || !address) {
          showFormAlert('Missing Fields', 'Please complete all business parameter fields.');
          return;
        }
      } else {
        if (!fullName || !ninNumber || !email || !phone || !address) {
          showFormAlert('Missing Fields', 'Please complete all individual identification fields.');
          return;
        }
        if (ninNumber.length !== 11) {
          showFormAlert('NIN Error', 'Your National Identification Number must be exactly 11 digits.');
          return;
        }
      }
      setStep('documents');
    } else if (step === 'documents') {
      if (taxpayerType === 'corporate') {
        if (!uploadedCac || !uploadedUtility || !uploadedMemart) {
          showFormAlert('Upload Status', 'All 3 corporate documents must be uploaded.');
          return;
        }
      } else {
        if (!uploadedId || !uploadedUtility) {
          showFormAlert('Upload Status', 'Both identification documents must be uploaded.');
          return;
        }
      }
      setStep('review_submit');
    }
  };

  // Stage-aware back arrow navigation system
  const handleBack = () => {
    if (isSubmitted) {
      if (onClose) onClose();
      navigation.navigate('HomeScreen');
    } else if (step === 'taxpayer_select') {
      if (onClose) onClose();
      navigation.goBack(); // Safely exit screen if at the very beginning
    } else if (step === 'basic_info') {
      setStep('taxpayer_select');
    } else if (step === 'documents') {
      setStep('basic_info');
    } else if (step === 'review_submit') {
      setStep('documents');
    }
  };

  const handleSubmitToAdmin = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      const registeredName = taxpayerType === 'corporate' ? companyName : fullName;
      showFormAlert(
        'Submission Received', 
        `Your tax profile documentation for ${registeredName} has been received for processing.`
      );
      
      if (onSuccess) {
        onSuccess(registeredName);
      }
    }, 2500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* HEADER SYSTEM WITH ARROW NAVIGATION */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>TIN Registration Portal</Text>
        <Text style={styles.stepBadge}>
          {isSubmitted ? 'SUCCESS' : step.toUpperCase().replace('_', ' ')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* STEP 1: SELECT CLASS */}
        {step === 'taxpayer_select' && (
          <View>
            <Text style={styles.sectionTitle}>Select Taxpayer Class</Text>
            <Text style={styles.sectionSubtitle}>Select the tax framework that aligns with your profile structure.</Text>
            
            <Pressable 
              style={[styles.optionCard, taxpayerType === 'corporate' ? styles.optionCardSelected : null]} 
              onPress={() => setTaxpayerType('corporate')}
            >
              <Ionicons name="business-outline" size={24} color={taxpayerType === 'corporate' ? '#ffffff' : BRAND_COLOR} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, taxpayerType === 'corporate' ? styles.textWhite : null]}>Corporate / Non-Individual</Text>
                <Text style={[styles.optionDesc, taxpayerType === 'corporate' ? styles.textWhiteMuted : null]}>Limited Companies (LTD), Partnerships, and Registered NGOs.</Text>
              </View>
            </Pressable>

            <Pressable 
              style={[styles.optionCard, taxpayerType === 'individual' ? styles.optionCardSelected : null]} 
              onPress={() => setTaxpayerType('individual')}
            >
              <Ionicons name="person-outline" size={24} color={taxpayerType === 'individual' ? '#ffffff' : BRAND_COLOR} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, taxpayerType === 'individual' ? styles.textWhite : null]}>Individual Taxpayer</Text>
                <Text style={[styles.optionDesc, taxpayerType === 'individual' ? styles.textWhiteMuted : null]}>Freelancers, Sole Proprietors, Employed Staff, and Private Taxpayers.</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* STEP 2: DETAILS ENTRY */}
        {step === 'basic_info' && (
          <View>
            <Text style={styles.sectionTitle}>Taxpayer Information</Text>
            <Text style={styles.sectionSubtitle}>Inputs must match your official civil registry data exactly.</Text>

            {taxpayerType === 'corporate' ? (
              <View>
                <Text style={styles.inputLabel}>Registered Business Name (Matches CAC Record)</Text>
                <TextInput style={styles.input} placeholder="e.g., Evault & iServebay LTD" value={companyName} onChangeText={setCompanyName} />
                
                <Text style={styles.inputLabel}>Corporate Affairs Commission Registration Number</Text>
                <TextInput style={styles.input} placeholder="e.g., RC 1928374 or BN 48392" value={cacNumber} onChangeText={setCacNumber} />
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>Full Name (Matches Government Issued ID)</Text>
                <TextInput style={styles.input} placeholder="e.g., Mohammad Ziyaulhaq Mohammad" value={fullName} onChangeText={setFullName} />
                
                <Text style={styles.inputLabel}>National Identification Number (NIN)</Text>
                <TextInput style={styles.input} keyboardType="numeric" maxLength={11} placeholder="Enter 11-Digit identity key" value={ninNumber} onChangeText={setNinNumber} />
              </View>
            )}

            <Text style={styles.inputLabel}>Primary Contact Phone Number</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" placeholder="+234 803 000 0000" value={phone} onChangeText={setPhone} />

            <Text style={styles.inputLabel}>Official Contact Email</Text>
            <TextInput style={styles.input} keyboardType="email-address" placeholder="info@iservebay.com" autoCapitalize="none" value={email} onChangeText={setEmail} />

            <Text style={styles.inputLabel}>Physical Tax Address (Matches Utility bill)</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline placeholder="State, LGA, street name, house info..." value={address} onChangeText={setAddress} />
          </View>
        )}

        {/* STEP 3: DOCUMENT CHECKLISTS */}
        {step === 'documents' && (
          <View>
            <Text style={styles.sectionTitle}>Required Uploads</Text>
            <Text style={styles.sectionSubtitle}>Please scan and upload clean copies of your files.</Text>

            {taxpayerType === 'corporate' ? (
              <View style={styles.innerFormBox}>
                <Text style={styles.formBoxTitle}>Corporate Credentials</Text>
                
                <View style={styles.uploadRowVertical}>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>CAC Certificate of Incorporation</Text>
                    <Text style={styles.uploadDesc}>{uploadedCac ? "Ready: cac_certificate.pdf" : "Official business setup slip"}</Text>
                  </View>
                  <Pressable style={[styles.uploadBtn, uploadedCac ? styles.uploadBtnActive : null]} onPress={() => setUploadedCac(!uploadedCac)}>
                    <Ionicons name={uploadedCac ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={uploadedCac ? "#ffffff" : BRAND_COLOR} />
                    <Text style={[styles.uploadBtnText, uploadedCac ? styles.textWhite : null]}>{uploadedCac ? 'Uploaded' : 'Upload'}</Text>
                  </Pressable>
                </View>

                <View style={styles.uploadRowVertical}>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>MEMART / Status Report</Text>
                    <Text style={styles.uploadDesc}>{uploadedMemart ? "Ready: memart_doc.pdf" : "Official directorship registry list"}</Text>
                  </View>
                  <Pressable style={[styles.uploadBtn, uploadedMemart ? styles.uploadBtnActive : null]} onPress={() => setUploadedMemart(!uploadedMemart)}>
                    <Ionicons name={uploadedMemart ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={uploadedMemart ? "#ffffff" : BRAND_COLOR} />
                    <Text style={[styles.uploadBtnText, uploadedMemart ? styles.textWhite : null]}>{uploadedMemart ? 'Uploaded' : 'Upload'}</Text>
                  </Pressable>
                </View>

                <View style={styles.uploadRowVertical}>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>Office Utility Bill (Proof of Location)</Text>
                    <Text style={styles.uploadDesc}>{uploadedUtility ? "Ready: energy_bill.jpg" : "Utility statement (less than 3 months old)"}</Text>
                  </View>
                  <Pressable style={[styles.uploadBtn, uploadedUtility ? styles.uploadBtnActive : null]} onPress={() => setUploadedUtility(!uploadedUtility)}>
                    <Ionicons name={uploadedUtility ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={uploadedUtility ? "#ffffff" : BRAND_COLOR} />
                    <Text style={[styles.uploadBtnText, uploadedUtility ? styles.textWhite : null]}>{uploadedUtility ? 'Uploaded' : 'Upload'}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.innerFormBox}>
                <Text style={styles.formBoxTitle}>Individual Identification Docs</Text>

                <View style={styles.uploadRowVertical}>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>NIN Slip or Valid Government ID</Text>
                    <Text style={styles.uploadDesc}>{uploadedId ? "Ready: identity_card.jpg" : "NIMC slip, Passport, or Driver's license"}</Text>
                  </View>
                  <Pressable style={[styles.uploadBtn, uploadedId ? styles.uploadBtnActive : null]} onPress={() => setUploadedId(!uploadedId)}>
                    <Ionicons name={uploadedId ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={uploadedId ? "#ffffff" : BRAND_COLOR} />
                    <Text style={[styles.uploadBtnText, uploadedId ? styles.textWhite : null]}>{uploadedId ? 'Uploaded' : 'Upload'}</Text>
                  </Pressable>
                </View>

                <View style={styles.uploadRowVertical}>
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadTitle}>Residential Utility Bill</Text>
                    <Text style={styles.uploadDesc}>{uploadedUtility ? "Ready: resident_utility.pdf" : "Recent utility payment proof document"}</Text>
                  </View>
                  <Pressable style={[styles.uploadBtn, uploadedUtility ? styles.uploadBtnActive : null]} onPress={() => setUploadedUtility(!uploadedUtility)}>
                    <Ionicons name={uploadedUtility ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={uploadedUtility ? "#ffffff" : BRAND_COLOR} />
                    <Text style={[styles.uploadBtnText, uploadedUtility ? styles.textWhite : null]}>{uploadedUtility ? 'Uploaded' : 'Upload'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 4: REVIEW AND SUBMIT */}
        {step === 'review_submit' && (
          <View style={styles.checkoutBox}>
            {isSubmitted ? (
              <View style={styles.successWrapper}>
                <View style={styles.successCircle}>
                  <Ionicons name="checkbox" size={42} color="#ffffff" />
                </View>
                <Text style={styles.taxTitle}>Filing Details Received</Text>
                <Text style={styles.successHeadingText}>Processing Underway</Text>
                <Text style={styles.tinDesc}>
                  Your parameters have been logged into the administration database. Our team will verify the files and send processing status updates via WhatsApp and Email.
                </Text>
              </View>
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Ionicons name="document-text-outline" size={48} color={BRAND_COLOR} style={{ marginBottom: 12 }} />
                <Text style={styles.sectionTitle}>Review Filing Details</Text>
                <Text style={styles.checkoutSub}>Please verify all parameters match your paperwork before submitting to operations.</Text>
              </View>
            )}

            <View style={styles.ledger}>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Taxpayer Class</Text>
                <Text style={styles.ledgerValText}>{taxpayerType === 'corporate' ? 'Corporate Entity' : 'Individual Taxpayer'}</Text>
              </View>
              <View style={styles.ledgerDash} />
              
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Profile Name</Text>
                <Text style={styles.ledgerValText} numberOfLines={1}>
                  {taxpayerType === 'corporate' ? companyName : fullName}
                </Text>
              </View>
              <View style={styles.ledgerDash} />

              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Validation Key</Text>
                <Text style={styles.ledgerValText}>
                  {taxpayerType === 'corporate' ? `CAC: ${cacNumber}` : `NIN: ${ninNumber}`}
                </Text>
              </View>
              <View style={styles.ledgerDash} />

              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLbl}>Contact Details</Text>
                <Text style={styles.ledgerValText} numberOfLines={1}>{email}</Text>
              </View>
            </View>

            {!isSubmitted && (
              <View style={styles.warningBox}>
                <Ionicons name="information-circle-outline" size={18} color="#0369a1" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.warningTxt}>
                  Filing applications are processed manually by our operational administrative team. Ensure all documents are clear to guarantee swift processing and validation.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEPPER ACTUATOR ACTIONS */}
        {step !== 'review_submit' ? (
          <Pressable 
            style={[styles.primaryBtn, (step === 'taxpayer_select' && !taxpayerType) ? { backgroundColor: '#cbd5e1' } : null]} 
            onPress={handleNext}
            disabled={step === 'taxpayer_select' && !taxpayerType}
          >
            <Text style={styles.primaryBtnTxt}>Continue</Text>
          </Pressable>
        ) : (
          !isSubmitted ? (
            <Pressable 
              style={[styles.primaryBtn, isSubmitting ? { backgroundColor: '#475569' } : null]} 
              onPress={handleSubmitToAdmin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 10 }} />
                  <Text style={styles.primaryBtnTxt}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnTxt}>Submit Application</Text>
              )}
            </Pressable>
          ) : (
            <Pressable 
              style={[styles.primaryBtn, { backgroundColor: '#0f172a' }]} 
              onPress={() => {
                if (onClose) onClose(); 
                navigation.navigate('HomeScreen'); // Wired up correctly now
              }}
            >
              <Text style={styles.primaryBtnTxt}>Return to Dashboard</Text>
            </Pressable>
          )
        )}

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
    backgroundColor: '#f1f5f9',
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
  formBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadRowVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  uploadInfo: {
    flex: 1,
    marginRight: 10,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  uploadDesc: {
    fontSize: 11,
    color: '#94a3b8',
  },
  uploadBtn: {
    flexDirection: 'row',
    height: 36,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  uploadBtnActive: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
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
  successWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  successHeadingText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  tinDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 18,
    marginTop: 6
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
    marginTop: 10,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
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
    backgroundColor: '#f0f9ff',
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
    alignItems: 'center',
    marginTop: 28,
    justifyContent: 'center'
  },
  primaryBtnTxt: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWhite: { color: '#ffffff' },
  textWhiteMuted: { color: 'rgba(255, 255, 255, 0.7)' },
});