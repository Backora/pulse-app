import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/theme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BACKORA</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>ENTRAR NO PULSO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  logo: { color: COLORS.text, fontSize: 32, fontWeight: '900', letterSpacing: 10 },
  button: { marginTop: 40, borderWidth: 1, borderColor: COLORS.border, padding: 15, width: 200 },
  buttonText: { color: COLORS.text, textAlign: 'center', fontWeight: 'bold' }
});