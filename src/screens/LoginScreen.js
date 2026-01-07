import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
  ActivityIndicator, Alert 
} from 'react-native';
import { supabase } from '../supabase';

export default function LoginScreen({ navigation }) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleAccess = async () => {
    if (nickname.length <= 2) return;

    setLoading(true);
    try {
      // AJUSTE: Enviando os 3 parâmetros que a função do Alex exige
      const { error } = await supabase.rpc('register_user', {
        p_username: nickname, 
        p_avatar_url: '' 
      });

      if (error) throw error;

      navigation.navigate('Menu', { nickname });
      
    } catch (error) {
      console.error("Erro no acesso:", error);
      Alert.alert("SIGNAL_LOST", "Erro ao sincronizar identificação. Verifica os parâmetros com o Alex.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.inner}
        >
          
          {/* LOGO AREA */}
          <View style={styles.logoWrapper}>
            <Text style={[styles.logo, { color: ALEX_COLOR }]}>P U L S E</Text>
            <Text style={styles.subLogo}>ENCRYPTED COMMUNICATION</Text> 
          </View>

          {/* INPUT AREA */}
          <View style={styles.inputContainer}>
            <TextInput 
              style={[styles.input, { color: ALEX_COLOR }]}
              placeholder="IDENTIFY YOURSELF"
              placeholderTextColor="#444"
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={ALEX_COLOR}
              cursorColor={ALEX_COLOR}
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={[styles.button, { opacity: nickname.length > 2 && !loading ? 1 : 0 }]}
              onPress={handleAccess}
              disabled={nickname.length <= 2 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={ALEX_COLOR} />
              ) : (
                <Text style={[styles.buttonText, { color: ALEX_COLOR }]}>ACCESS</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>BY BACKORA</Text>
          </View>

        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  inner: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  logoWrapper: { 
    alignItems: 'center', 
    marginBottom: 80 
  },
  logo: { 
    fontSize: 22, 
    fontWeight: '100', 
    letterSpacing: 20, 
    textAlign: 'center',
    paddingLeft: 20, 
  },
  subLogo: {
    color: '#555',
    fontSize: 7,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '400'
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: { 
    width: '80%', 
    fontSize: 12, 
    letterSpacing: 5, 
    paddingVertical: 15, 
    textAlign: 'center', 
    fontWeight: '300',
    borderBottomWidth: 0.5,
    borderBottomColor: '#222'
  },
  button: { 
    marginTop: 50, 
    paddingVertical: 10,
    paddingHorizontal: 30,
    minHeight: 40,
    justifyContent: 'center'
  },
  buttonText: { 
    fontSize: 10, 
    letterSpacing: 8, 
    fontWeight: '300' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center' 
  },
  footerText: { 
    color: '#444', 
    fontSize: 8, 
    letterSpacing: 10, 
    fontWeight: '300' 
  }
});