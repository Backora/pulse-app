import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
  ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

export default function LoginScreen({ navigation }) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleAccess = async () => {
    if (nickname.length <= 2) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('register_user', {
        p_username: nickname, 
        p_avatar_url: '' 
      });

      if (error) throw error;
      navigation.navigate('Menu', { nickname });
      
    } catch (error) {
      console.error("Erro no acesso:", error);
      Alert.alert("SIGNAL_LOST", "Erro ao sincronizar identificação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.inner}
        >
          
          {/* LOGO AREA - Ajustada para simetria perfeita */}
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
              underlineColorAndroid="transparent"
            />
            
            <TouchableOpacity 
              style={[
                styles.button, 
                { 
                  opacity: nickname.length > 2 && !loading ? 1 : 0,
                  borderColor: '#1A1A1A'
                }
              ]}
              onPress={handleAccess}
              disabled={nickname.length <= 2 || loading}
              activeOpacity={0.7}
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
      </SafeAreaView>
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
    // COMPENSAÇÃO ANDROID:
    paddingLeft: Platform.OS === 'android' ? 20 : 0, 
  },
  subLogo: {
    color: '#555',
    fontSize: 7,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '400',
    // COMPENSAÇÃO ANDROID:
    paddingLeft: Platform.OS === 'android' ? 6 : 0,
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
    borderBottomColor: '#222',
    // COMPENSAÇÃO ANDROID para o placeholder:
    paddingLeft: Platform.OS === 'android' ? 5 : 0,
  },
  button: { 
    marginTop: 50, 
    paddingVertical: 12,
    paddingHorizontal: 35,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderRadius: 2,
    ...Platform.select({
      android: { elevation: 0 },
      ios: { shadowOpacity: 0 }
    })
  },
  buttonText: { 
    fontSize: 10, 
    letterSpacing: 8, 
    fontWeight: '300',
    // COMPENSAÇÃO ANDROID:
    paddingLeft: Platform.OS === 'android' ? 8 : 0,
  },
  footer: { 
    position: 'absolute', 
    bottom: Platform.OS === 'android' ? 20 : 40, 
    alignSelf: 'center' 
  },
  footerText: { 
    color: '#444', 
    fontSize: 8, 
    letterSpacing: 10, 
    fontWeight: '300',
    // COMPENSAÇÃO ANDROID:
    paddingLeft: Platform.OS === 'android' ? 10 : 0,
  }
});