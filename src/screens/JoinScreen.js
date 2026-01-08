import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ActivityIndicator, Alert, 
  Keyboard, TouchableWithoutFeedback // 1. IMPORTA ESTES DOIS
} from 'react-native';
import { supabase } from '../supabase';

export default function JoinScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const [pulseCode, setPulseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleTextChange = (text) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4, 6);
    setPulseCode(formatted.slice(0, 8));
  };

  const handleJoin = async () => {
    if (pulseCode.length < 8) {
      Alert.alert("INVALID_FORMAT", "O código deve seguir o padrão XX-XX-XX");
      return;
    }
    setLoading(true);
    Keyboard.dismiss(); // 2. GARANTE QUE FECHA AO CLICAR NO BOTÃO

    try {
      const { data, error } = await supabase
        .from('pulses')
        .select('*')
        .eq('pulse_code', pulseCode)
        .single();

      if (error || !data) {
        Alert.alert("SIGNAL_LOST", "Sinal não encontrado ou expirado.");
      } else {
        navigation.navigate('Chat', { nickname, pulseCode: data.pulse_code, isNew: false });
      }
    } catch (err) {
      Alert.alert("ERROR", "Falha na sincronização.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 3. ENVOLVE TUDO COM O TOUCHABLE PARA SAIR DO TECLADO
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.headerBox}>
            <Text style={styles.operatorLabel}>ID // {nickname.toUpperCase()}</Text>
            <View style={[styles.statusLine, { backgroundColor: ALEX_COLOR }]} />
          </View>

          <View style={styles.centerWrapper}>
            <Text style={styles.inputLabel}>ENTER_HEX_SIGNAL</Text>
            <TextInput
              style={[styles.input, { color: ALEX_COLOR }]}
              placeholder="XX-XX-XX"
              placeholderTextColor="#1A1A1A"
              value={pulseCode}
              onChangeText={handleTextChange}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done" // 4. MUDA O BOTÃO DO TECLADO PARA "DONE"
              onSubmitEditing={handleJoin} // 5. PERMITE ENTRAR LOGO PELO TECLADO
            />

            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: '#222' }]} 
              onPress={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={ALEX_COLOR} />
              ) : (
                <Text style={[styles.actionText, { color: ALEX_COLOR }]}>ESTABLISH_LINK</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>ABORT_CONNECTION</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>BY BACKORA</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ... os teus estilos continuam iguais ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  headerBox: { position: 'absolute', top: 60, left: 40 },
  operatorLabel: { color: '#666', fontSize: 8, letterSpacing: 4, fontWeight: '300' },
  statusLine: { width: 20, height: 1, marginTop: 8, opacity: 0.5 },
  centerWrapper: { width: '100%', alignItems: 'center' },
  inputLabel: { color: '#444', fontSize: 7, letterSpacing: 5, marginBottom: 20 },
  input: { fontSize: 28, letterSpacing: 8, fontWeight: '200', textAlign: 'center', width: '100%', marginBottom: 40 },
  actionBtn: { borderWidth: 0.5, paddingVertical: 12, paddingHorizontal: 30 },
  actionText: { fontSize: 9, letterSpacing: 4, fontWeight: '300' },
  backBtn: { marginTop: 80, borderBottomWidth: 0.5, borderBottomColor: '#222', paddingBottom: 4 },
  backText: { color: '#444', fontSize: 8, letterSpacing: 4, fontWeight: '300' },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  footerText: { color: '#444', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});