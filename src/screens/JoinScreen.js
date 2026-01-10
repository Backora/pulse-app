import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ActivityIndicator, Alert, 
  Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import { supabase } from '../supabase';
import { translations } from '../translations'; // IMPORTAÇÃO DO TRADUTOR

export default function JoinScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const lang = params.lang || 'pt'; // HERANÇA DO IDIOMA
  
  const [pulseCode, setPulseCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const t = translations[lang] || translations['pt'];
  const ALEX_COLOR = '#C9C4C4';

  const handleTextChange = (text) => {
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4, 6);
    setPulseCode(formatted.slice(0, 8));
  };

  const handleJoin = async () => {
    // Validação de formato traduzida
    if (pulseCode.length < 8) {
      Alert.alert(t.join_err_format || "INVALID_FORMAT", "XX-XX-XX");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 1. VERIFICAÇÃO DE SEGURANÇA
      const { data: pulse, error: pulseError } = await supabase
        .from('pulses')
        .select('p_creator_id')
        .eq('pulse_code', pulseCode)
        .single();

      if (pulseError || !pulse) {
        Alert.alert(t.join_err_lost || "SIGNAL_LOST", t.err_msg || "Sinal não encontrado.");
        setLoading(false);
        return;
      }

      // 2. BLOQUEIO SE FOR O HOST
      if (pulse.p_creator_id.toLowerCase() === nickname.toLowerCase()) {
        Alert.alert(t.err_title || "ACCESS_DENIED", "Host: use logs.");
        setLoading(false);
        return;
      }

      // 3. BLOQUEIO SE JÁ ESTIVER LIGADO
      const { data: alreadyJoined } = await supabase
        .from('pulse_participants')
        .select('*')
        .eq('pulse_code', pulseCode)
        .eq('user_id', nickname)
        .single();

      if (alreadyJoined) {
        Alert.alert(t.err_title || "ALREADY_CONNECTED", "Ligação já ativa.");
        setLoading(false);
        return;
      }

      // 4. FUNÇÃO DE JOIN
      const { error: rpcError } = await supabase.rpc('send_join_pulse', { 
        p_user_id: nickname,   
        p_pulse_code: pulseCode 
      });

      if (rpcError) throw rpcError;

      // Sucesso: Vai para o chat (passando lang)
      navigation.navigate('Chat', { 
        nickname, 
        pulseCode: pulseCode, 
        isAdmin: false, 
        isNew: false,
        lang: lang 
      });

    } catch (err) {
      console.log("JOIN_ERROR:", err.message);
      Alert.alert(t.err_title || "SYSTEM_FAILURE", t.err_msg || "Erro crítico.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inner}>
          
          <View style={styles.headerBox}>
            <Text style={styles.operatorLabel}>{t.menu_welcome}{nickname.toUpperCase()}</Text>
            <View style={[styles.statusLine, { backgroundColor: ALEX_COLOR }]} />
          </View>

          <View style={styles.centerWrapper}>
            <Text style={styles.inputLabel}>{t.join_input_label || "ENTER_HEX_SIGNAL"}</Text>
            
            <TextInput
              style={[styles.input, { color: ALEX_COLOR }]}
              placeholder="XX-XX-XX"
              placeholderTextColor="#1A1A1A"
              value={pulseCode}
              onChangeText={handleTextChange}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />

            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: '#222' }]} 
              onPress={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={ALEX_COLOR} />
              ) : (
                <Text style={[styles.actionText, { color: ALEX_COLOR }]}>
                  {t.join_btn || "ESTABLISH_LINK"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t.join_abort || "ABORT_CONNECTION"}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.footer}</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

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