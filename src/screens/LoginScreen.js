import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';

export default function LoginScreen() {
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');

  // A cor exata que o Alex pediu
  const ALEX_COLOR = '#C9C4C4';

  const isReady = code.length === 6 && nickname.length > 2;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}
        >
          <View style={styles.inner}>
            
            { }
            <Text style={[styles.logo, { color: ALEX_COLOR }]}>PULSE</Text>
            
            <View style={styles.form}>
              <TextInput 
                style={[styles.input, { color: ALEX_COLOR }]}
                placeholder="CÓDIGO"
                placeholderTextColor="#333"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                maxLength={6}
              />
              
              <TextInput 
                style={[styles.input, { color: ALEX_COLOR }]}
                placeholder="NICKNAME"
                placeholderTextColor="#333"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, { borderColor: ALEX_COLOR, opacity: isReady ? 1 : 0.2 }]}
              disabled={!isReady}
            >
              <Text style={[styles.buttonText, { color: ALEX_COLOR }]}>CONECTAR</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>BY BACKORA</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', padding: 40 },
  logo: { 
    fontSize: 42, 
    fontWeight: '900', 
    letterSpacing: 12, 
    textAlign: 'center', 
    marginBottom: 60 
  },
  form: { gap: 15 },
  input: { 
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    fontSize: 14, 
    letterSpacing: 3,
    paddingVertical: 15,
    textAlign: 'center'
  },
  button: { 
    marginTop: 60,
    paddingVertical: 15,
    borderWidth: 1
  },
  buttonText: { 
    textAlign: 'center', 
    fontSize: 12, 
    fontWeight: 'bold', 
    letterSpacing: 2 
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  footerText: {
    color: '#222', 
    fontSize: 8,
    letterSpacing: 6
  }
});