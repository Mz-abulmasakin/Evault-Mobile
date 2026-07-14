import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function UserCard({ username, bank, accountNumber, accountBalance }) {
  
  // State to track if the balance is visible or hidden
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Header Info */}
      <View style={styles.textWrapper}>
        <Text style={styles.greetingText}>Hello, {username}!</Text>
        <Text style={styles.bankText}>{bank}</Text>
      </View>

      {/* Account Number Details */}
      <View style={styles.textNumberAcc}>
        <Text style={styles.labelText}>Account Number</Text>
        <Text style={styles.accountNumberText}>
          {accountNumber}
        </Text>
      </View>

      {/* Account Balance Details (With Toggle Button) */}
      <View style={styles.balanceContainer}>
        <View>
          <Text style={styles.labelText}>Account Balance</Text>
          <Text style={styles.balanceValueText}>
            ₦{isBalanceVisible ? accountBalance : '••••••••'}
          </Text>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]} 
          onPress={() => setIsBalanceVisible(!isBalanceVisible)}
        >
          <Text style={styles.buttonText}>
            {isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: '#2a5fd3', 
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  textWrapper: {  
    marginBottom: 16,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bankText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  textNumberAcc: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
    marginBottom: 16,
  },
  labelText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountNumberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  balanceValueText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.85,
    scale: 0.97,
  },
  buttonText: {
    color: '#2a5fd3',
    fontWeight: '700',
    fontSize: 11,
  },
});