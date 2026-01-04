import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ChatScreen({ navigation }) { // Adicionamos navigation aqui
  const ALEX_COLOR = '#C9C4C4';

  return (
    <View style={styles.container}>
      {/* Botão de Sair Minimalista */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()} // A função mágica para voltar
      >
        <Text style={styles.backText}>DISCONNECT</Text>
      </TouchableOpacity>

      <Text style={[styles.text, { color: ALEX_COLOR }]}>
        PULSE CHAT
      </Text>
      <Text style={styles.subText}>AGUARDANDO CONEXÃO DO ALEX...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60, // Ajusta conforme o entalhe do teu telemóvel
    left: 30,
  },
  backText: {
    color: '#333',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  subText: {
    color: '#333',
    fontSize: 10,
    marginTop: 20,
    letterSpacing: 2,
  }
});