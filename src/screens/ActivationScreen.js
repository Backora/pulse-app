import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from 'react-native';
// 1. Importação necessária para gerenciar o topo da tela no Android/iOS
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

export default function ActivationScreen({ navigation }) {
  const [pulseKey, setPulseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivation = async () => {
    if (!pulseKey) {
      Alert.alert('Pulse', 'Por favor, insira uma chave válida.');
      return;
    }

    setLoading(true);

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

    console.log('Chave válida!', data);
    Alert.alert('Sucesso', 'Acesso autorizado. O Pulso está ativo.');
    setLoading(false);
  };

  return (
    // 2. SafeAreaView substitui a View principal para evitar cortes no topo
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>PULSE</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ENTER PULSE-KEY"
          placeholderTextColor="#333"
          value={pulseKey}
          onChangeText={setPulseKey}
          autoCapitalize="characters"
          secureTextEntry
          underlineColorAndroid="transparent" // Remove linha azul padrão do Android
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    // 3. Substituição de borda grossa por visual minimalista HD
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
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
    // 4. Implementação da borda fina consistente com remoção de sombra Android
    borderWidth: 0.5,
    borderColor: '#C9C4C4', // Usando sua cor metalizada
    alignItems: 'center',
    borderRadius: 2, // Cantos mais retos para look tech
    ...Platform.select({
      android: { elevation: 0 },
      ios: { shadowOpacity: 0 }
    })
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