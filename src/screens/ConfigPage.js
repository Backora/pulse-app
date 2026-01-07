import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase'; 

export default function ConfigPage({ route, navigation }) {
  // Recebe o nickname vindo do Login/Menu
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';

  const [selectedDuration, setSelectedDuration] = useState('1h');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleStartPulse = async () => {
    setLoading(true);
    try {
      // Sincronizado com a lógica de "p_creator_id" que o Alex preparou
      const { data, error } = await supabase.rpc('generate_pulse', { 
        duration_pref: selectedDuration,
        p_creator_id: nickname // Aqui enviamos o teu nome como ID do criador
      });

      if (error) throw error;

      if (data && data[0]) {
        const pulse = data[0];
        Alert.alert(
          "PULSE_ESTABLISHED", 
          `CODE: ${pulse.pulse_code}\nVALID_FOR: ${selectedDuration}\nOPERATOR: ${nickname}`,
          [{ 
            text: "ENTER_CHANNEL", 
            onPress: () => navigation.navigate('Chat', { nickname, pulseCode: pulse.pulse_code }) 
          }]
        );
      }
    } catch (error) {
      console.error("Erro ao gerar pulse:", error);
      // Se der erro de RLS aqui, o Alex precisa desativar o RLS na tabela 'pulses' também
      Alert.alert("SYSTEM_FAILURE", "Não foi possível registar o Pulse. Verifica a segurança da tabela com o Alex.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            >
              <Text style={[
                styles.optionText, 
                { color: selectedDuration === time ? ALEX_COLOR : '#333' }
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
          <Text style={styles.backText}>← ABORT_MISSION</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BACKORA_OS_v2.6</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { position: 'absolute', top: 100, alignItems: 'center' },
  headerLabel: { color: '#666', fontSize: 8, letterSpacing: 6, fontWeight: '300' },
  dot: { width: 2, height: 2, borderRadius: 1, marginTop: 15, opacity: 0.5 },
  
  optionsWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
    marginTop: 40 
  },
  optionBtn: { padding: 10, alignItems: 'center' },
  optionText: { fontSize: 18, letterSpacing: 8, fontWeight: '100' },
  activeBar: { width: 15, height: 1, marginTop: 8 },

  generateBtn: { 
    marginTop: 80,
    borderBottomWidth: 0.5, 
    borderBottomColor: '#222', 
    paddingBottom: 8,
    minWidth: 150,
    alignItems: 'center'
  },
  generateText: { fontSize: 9, letterSpacing: 6, fontWeight: '300' },
  
  backBtn: { marginTop: 60 },
  backText: { color: '#444', fontSize: 8, letterSpacing: 4 },
  
  footer: { position: 'absolute', bottom: 40 },
  footerText: { color: '#333', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});