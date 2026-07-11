import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function UserCard({ username, bank, accountNumber, accountBalance }) {
  
  // 1. Properly declare the visibility state
  const [isTrue, setIsTrue] = useState(false);

  return (
    <View style={styles.container}>
      
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Hello! {username}</Text>
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.text}>{bank}</Text>
      </View>

      <View style={styles.textNumberAcc}>
        {/* 2. Uses the state to show account number or hidden mask */}
        <Text style={styles.textNumber}>
          Account: {isTrue ? accountNumber : '**********'}
        </Text>
        
        {/* 3. Corrected Pressable tag, style injection, and toggle function */}
        <Pressable 
          style={styles.button} 
          onPress={() => setIsTrue(!isTrue)}
        >
          <Text style={styles.buttonText}>
            {isTrue ? 'Hide Number' : 'View Number'}
          </Text>
        </Pressable>

        <Text style={styles.text}>Account Balance: ₦{accountBalance}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    backgroundColor: '#2a5fd3', // Enclosed in quotes with #
    elevation: 5,
    padding: 25,
    margin: 15,
  },
  textWrapper: {  
    marginBottom: 8,
  },
  text: {
    color: '#FFFFFF', // Corrected 6-character hex string
    fontSize: 18,
  },
  textNumberAcc: {
    marginTop: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 15,
  },
  textNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  buttonText: {
    color: '#254099',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

