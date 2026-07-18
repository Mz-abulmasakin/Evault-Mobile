// components/CustomModal.jsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const BRAND_COLOR = '#2a5fd3';

export function CustomModal({ isVisible, onClose, title, children }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 1. Darkened Backdrop Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          
          {/* 2. Keyboard Prevention Wrapper */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalFlex}
          >
            <TouchableWithoutFeedback>
              {/* 3. The Bottom Sheet Plate */}
              <View style={styles.sheetPlate}>
                
                {/* Drag Handle Decoration */}
                <View style={styles.dragHandle} />

                {/* Header Container */}
                <View style={styles.header}>
                  <Text style={styles.modalTitle}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Main Dynamic Content Slot */}
                <View style={styles.contentBody}>
                  {children}
                </View>

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalFlex: { width: '100%' },
  sheetPlate: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingHorizontal: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#0F172A' 
  },
  closeButton: { 
    backgroundColor: '#F1F5F9', 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  closeButtonText: { 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: 'bold' 
  },
  contentBody: { 
    marginTop: 4 
  }
});