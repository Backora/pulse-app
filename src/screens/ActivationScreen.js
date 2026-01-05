import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase'; // Importa a conexão que criaste

export default function ActivationScreen({ navigation }) {
  const [pulseKey, setPulseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivation = async () => {
    if (!pulseKey) {
      Alert.alert('Pulse', 'Por favor, insira uma chave válida.');
      return;
    }

    setLoading(true);

    // 1. Verificar se a chave existe na tabela do Alex
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key_code', pulseKey)
      .single();

    if (error || !data) {
      Alert.alert('Erro', 'Pulse-Key inválida ou inexistente.');
      setLoading(false);
      return;
    }

    // 2. Lógica de Bloqueio de Dispositivo (Fase 2 avançada)
    // Por agora, vamos apenas deixar passar se a chave existir
    console.log('Chave válida!', data);
    
    // Aqui tu mandarias o user para a Home/Chat
    // navigation.navigate('ChatList'); 
    
    Alert.alert('Sucesso', 'Acesso autorizado. O Pulso está ativo.');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>PULSE</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ENTER PULSE-KEY"
          placeholderTextColor="#333"
          value={pulseKey}
          onChangeText={setPulseKey}
          autoCapitalize="characters"
          secureTextEntry // Mantém a chave secreta ao digitar
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleActivation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>ACTIVATE</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>ENCRYPTED ACCESS ONLY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Blackora Style
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: '200',
    color: '#fff',
    letterSpacing: 10,
    marginBottom: 60,
  },
  inputContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 40,
  },
  input: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 15,
    letterSpacing: 3,
  },
  button: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: '#333',
    fontSize: 10,
    letterSpacing: 2,
  },
});