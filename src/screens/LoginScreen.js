import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
  Keyboard, Animated, Alert, ActivityIndicator 
} from 'react-native';
import { supabase } from '../supabase'; 

export default function LoginScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ALEX_COLOR = '#C9C4C4';

  // Animação de Fade In entre passos
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();
  }, [step]);

  // FUNÇÃO: ENTRAR NUM PULSO EXISTENTE (VALIDA NA TABELA PULSES)
  const handleConnect = async () => {
    if (code.length !== 6) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pulses')
        .select('*')
        .eq('pulse_code', code.toUpperCase())
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Este Pulse é inválido ou já expirou.");
      } else {
        // Sucesso! Leva o utilizador direto para o Chat
        navigation.navigate('Chat', { nickname, pulseCode: data.pulse_code });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}
        >
          <View style={styles.inner}>
            <Text style={[styles.logo, { color: ALEX_COLOR }]}>PULSE</Text>

            <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
              
              {/* PASSO 1: DEFINIR NICKNAME */}
              {step === 1 && (
                <View>
                  <TextInput 
                    style={[styles.input, { color: ALEX_COLOR }]}
                    placeholder="NICKNAME" placeholderTextColor="#333"
                    value={nickname} onChangeText={setNickname}
                    autoFocus autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    style={[styles.button, { borderColor: ALEX_COLOR, opacity: nickname.length > 2 ? 1 : 0.2 }]}
                    onPress={() => setStep(2)} disabled={nickname.length <= 2}
                  >
                    <Text style={[styles.buttonText, { color: ALEX_COLOR }]}>PRÓXIMO</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* PASSO 2: ESCOLHER AÇÃO */}
              {step === 2 && (
                <View>
                  <Text style={styles.welcomeText}>OLÁ, {nickname.toUpperCase()}</Text>
                  
                  {/* Navega para a ConfigPage que criámos */}
                  <TouchableOpacity 
                    style={styles.card} 
                    onPress={() => navigation.navigate('Config', { nickname })}
                  >
                    <Text style={[styles.cardTitle, { color: ALEX_COLOR }]}>CRIAR NOVO PULSE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.card} onPress={() => setStep(3)}>
                    <Text style={[styles.cardTitle, { color: ALEX_COLOR }]}>ENTRAR NUM PULSO</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.backLink}>ALTERAR NOME</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* PASSO 3: INSERIR CÓDIGO DE ACESSO */}
              {step === 3 && (
                <View>
                  <TextInput 
                    style={[styles.input, { color: ALEX_COLOR }]}
                    placeholder="6-DIGIT CODE" placeholderTextColor="#333"
                    value={code} onChangeText={setCode}
                    maxLength={6} autoFocus autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={[styles.button, { borderColor: ALEX_COLOR, opacity: code.length === 6 ? 1 : 0.2 }]}
                    onPress={handleConnect} disabled={code.length !== 6 || loading}
                  >
                    {loading ? <ActivityIndicator color={ALEX_COLOR} /> :
                    <Text style={[styles.buttonText, { color: ALEX_COLOR }]}>CONECTAR</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Text style={styles.backLink}>VOLTAR</Text>
                  </TouchableOpacity>
                </View>
              )}

            </Animated.View>

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
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 40 },
  logo: { fontSize: 42, fontWeight: '900', letterSpacing: 12, textAlign: 'center', marginBottom: 60 },
  contentArea: { width: '100%', minHeight: 280 },
  input: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A', fontSize: 14, letterSpacing: 3, paddingVertical: 15, textAlign: 'center' },
  button: { marginTop: 30, paddingVertical: 15, borderWidth: 1 },
  buttonText: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  card: { paddingVertical: 25, borderWidth: 1, borderColor: '#1A1A1A', alignItems: 'center', marginVertical: 8 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
  welcomeText: { color: '#333', fontSize: 10, textAlign: 'center', letterSpacing: 4, marginBottom: 20 },
  backLink: { color: '#222', fontSize: 9, textAlign: 'center', marginTop: 25, letterSpacing: 2 },
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: '#222', fontSize: 8, letterSpacing: 6 }
});