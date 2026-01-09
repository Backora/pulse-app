import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from 'react-native';
// 1. SafeAreaView para gerenciar Notch e barras de navegação
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase'; 

export default function ConfigPage({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';

  const [selectedDuration, setSelectedDuration] = useState('1h');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleStartPulse = async () => {
    setLoading(true);
    try {
      // 1. GERAÇÃO DO CÓDIGO FORMATADO: XX-XX-XX
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const gen = (len) => {
        let res = '';
        for (let i = 0; i < len; i++) {
          res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
      };
      
      // Monta o código com os traços
      const pulseCode = `${gen(2)}-${gen(2)}-${gen(2)}`; 
      
      // 2. Cálculo do tempo de expiração
      let hours = 1;
      if (selectedDuration === '24h') hours = 24;
      if (selectedDuration === '7d') hours = 168;
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      // 3. INSERT USANDO A COLUNA CORRETA: p_creator_id
      const { error } = await supabase
        .from('pulses')
        .insert([
          { 
            pulse_code: pulseCode, 
            p_creator_id: nickname, 
            expires_at: expiresAt,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // 4. SUCESSO -> CHAT
      navigation.navigate('Chat', { 
        nickname, 
        pulseCode: pulseCode,
        isAdmin: true,
        isNew: true 
      });

    } catch (error) {
      console.error("ERRO_AO_CRIAR:", error.message);
      Alert.alert("SYSTEM_FAILURE", "Erro ao gravar no banco: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>PULSE_CONFIGURATION</Text>
          <View style={[styles.dot, { backgroundColor: ALEX_COLOR }]} />
        </View>

        <View style={styles.optionsWrapper}>
          {['1h', '24h', '7d'].map((time) => (
            <TouchableOpacity 
              key={time} 
              style={styles.optionBtn} 
              onPress={() => setSelectedDuration(time)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionText, 
                { color: selectedDuration === time ? ALEX_COLOR : '#1A1A1A' } 
              ]}>
                {time.toUpperCase()}
              </Text>
              {selectedDuration === time && (
                <View style={[styles.activeBar, { backgroundColor: ALEX_COLOR }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.generateBtn, { opacity: loading ? 0.3 : 1 }]}
          onPress={handleStartPulse}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ALEX_COLOR} size="small" />
          ) : (
            <Text style={[styles.generateText, { color: ALEX_COLOR }]}>INITIALIZE_PULSE</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>ABORT_MISSION</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BACKORA_OS_v2.6</Text>
        </View>
      </View>
    </SafeAreaView>
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
  header: { 
    position: 'absolute', 
    top: Platform.OS === 'android' ? 60 : 100, // Ajuste para compensar StatusBar
    alignItems: 'center' 
  },
  headerLabel: { color: '#444', fontSize: 8, letterSpacing: 6, fontWeight: '300' },
  dot: { width: 2, height: 2, borderRadius: 1, marginTop: 15, opacity: 0.3 },
  optionsWrapper: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 40 },
  optionBtn: { padding: 10, alignItems: 'center' },
  optionText: { fontSize: 18, letterSpacing: 8, fontWeight: '100' },
  activeBar: { width: 20, height: 1, marginTop: 8 },
  generateBtn: { marginTop: 100, borderWidth: 0.5, borderColor: '#222', paddingVertical: 15, paddingHorizontal: 30, alignItems: 'center' },
  generateText: { fontSize: 9, letterSpacing: 6, fontWeight: '300' },
  backBtn: { marginTop: 80 },
  backText: { color: '#333', fontSize: 8, letterSpacing: 4 },
  footer: { position: 'absolute', bottom: 40 },
  footerText: { color: '#222', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});