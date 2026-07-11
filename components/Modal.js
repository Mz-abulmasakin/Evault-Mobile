import { 
  StyleSheet, Text, View, ImageBackground, ActivityIndicator, 
  Pressable, Platform, Alert, ScrollView, Image, Button, 
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput, Modal
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';

 
  export default function Modal(){
      const [modalVisible, setModalVisible] = useState(false); 
  <Pressable
       style={[styles.button, styles.buttonClose]}
         onPress={() => setModalVisible(!modalVisible)}>
           <Text style={styles.textStyle}> Close </Text>
                    </Pressable>
                  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Darkened base background
  },
  bgimage: {
    flex: 1, 
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 40, 
    paddingHorizontal: 20, 
    paddingBottom: 50, 
  },
  headerLogoWrapper: {
    width: '100%',
    alignItems: 'flex-start', 
    marginBottom: 20,
    marginTop: 10,
  },
  headerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // Changed to pure white
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Made shadow darker so it pops on any background
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10 
  },
  subtitle: {
    fontSize: 18,
    color: '#f8f9fa', // Changed to light off-white
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5
  },
  loaderContainer: {
    marginTop: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center', 
    marginBottom: 15,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  inlineButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '100%', 
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  btns: {
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a5fd3',
    paddingVertical: 18,     
    marginHorizontal: 5, 
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pressimg: {
    height: 60, 
    width: 60,  
    marginBottom: 8, 
    resizeMode: 'contain', 
  },
  videoContainer: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-around',
  },
  textInput: {
    height: 40,
    color: '#ffffff', // White text input
    borderColor: '#ffffff', // White border
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  modalTextInput: { // Separate style for the input inside the white modal
    height: 40,
    color: '#000000', 
    borderColor: '#000000', 
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40, 
  },
  modalView: {
    width: '90%', 
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    color: '#000000', // Keeps modal text dark on the white background
    marginBottom: 15,
    textAlign: 'center',
  },
});