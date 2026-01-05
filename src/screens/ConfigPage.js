import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase';

export default function ConfigPage({ route, navigation }) {
  const { nickname } = route.params; // Recebe o nome que vieste do login
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const handleCreatePulse = async (duration) => {
    setLoading(true);
    try {
      // Chamada RPC para o Alex
      const { data, error } = await supabase.rpc('generate_pulse', { 
        duration_pref: duration 
      });

      if (error) throw error;

      if (data && data[0]) {
        const pulse = data[0];
        Alert.alert(
          "PULSE ATIVO", 
          `Código: ${pulse.pulse_code}\nDuração: ${duration}`,
          [{ text: "ENTRAR NO CHAT", onPress: () => navigation.navigate('Chat', { nickname, pulseCode: pulse.pulse_code }) }]
        );
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao gerar o Pulse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>DEFINIÇÕES</Text>
        <Text style={styles.subtitle}>DURAÇÃO DO PULSE</Text>

        <View style={styles.presetContainer}>
          {['1h', '24h', '7d'].map((time) => (
            <TouchableOpacity 
              key={time} 
              style={styles.presetBtn} 
              onPress={() => handleCreatePulse(time)}
              disabled={loading}
            >
              <Text style={styles.presetText}>{time.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator color={ALEX_COLOR} style={{ marginTop: 30 }} />}

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 50 }}>
          <Text style={styles.backLink}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', padding: 40 },
  title: { color: '#C9C4C4', fontSize: 24, fontWeight: '900', letterSpacing: 8, textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#333', fontSize: 10, textAlign: 'center', letterSpacing: 4, marginBottom: 40 },
  presetContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  presetBtn: { flex: 1, borderWidth: 1, borderColor: '#1A1A1A', paddingVertical: 20, marginHorizontal: 5, alignItems: 'center' },
  presetText: { color: '#C9C4C4', fontSize: 12, fontWeight: 'bold' },
  backLink: { color: '#222', fontSize: 9, textAlign: 'center', letterSpacing: 2 }
});