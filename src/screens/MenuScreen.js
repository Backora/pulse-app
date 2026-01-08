import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';

export default function MenuScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const [loading, setLoading] = useState(false);
  
  const ALEX_COLOR = '#C9C4C4';

  // Função para desconectar e apagar TUDO (Panic)
  const handleDisconnect = () => {
    Alert.alert(
      "CONFIRM_DISCONNECT",
      "Sair apagará o teu perfil e todas as sessões ativas permanentemente. Continuar?",
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "WIPE_AND_EXIT", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Chamamos a mesma função de pânico que configuramos com o Alex
              const { error } = await supabase.rpc('panic', { p_user_id: nickname });
              
              if (error) throw error;

              // Após limpar o rastro, volta para o Login
              navigation.replace('Login');
            } catch (error) {
              console.error("Erro ao desconectar:", error);
              navigation.replace('Login');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        
        {/* Identificação do Operador */}
        <View style={styles.headerBox}>
          <Text style={styles.operatorLabel}>ID // {nickname.toUpperCase()}</Text>
          <View style={[styles.statusLine, { backgroundColor: ALEX_COLOR }]} />
        </View>

        {/* Core do Menu */}
        <View style={styles.menuWrapper}>
          <View style={styles.menuRow}>
            
            {/* CRIAR: Vai para a tela de Configuração */}
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => navigation.navigate('Config', { nickname })}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>CREATE</Text>
              <Text style={styles.menuDesc}>New Session</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            {/* JOIN: CORRIGIDO para ir para 'Join' em vez de 'Sessions' */}
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => navigation.navigate('Join', { nickname })}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>JOIN</Text>
              <Text style={styles.menuDesc}>Intercept</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Botão de Terminar - Agora com a lógica de WIPE */}
        <TouchableOpacity 
          onPress={handleDisconnect} 
          style={[styles.exitBtn, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text style={styles.exitText}>DISCONNECT</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>BY BACKORA</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  headerBox: { position: 'absolute', top: 60, left: 40 },
  operatorLabel: { color: '#666', fontSize: 8, letterSpacing: 4, fontWeight: '300' },
  statusLine: { width: 20, height: 1, marginTop: 8, opacity: 0.5 },
  menuWrapper: { width: '100%', height: 150, justifyContent: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  menuOption: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  menuTitle: { fontSize: 14, fontWeight: '200', letterSpacing: 10 },
  menuDesc: { color: '#555', fontSize: 7, letterSpacing: 3, marginTop: 12, textTransform: 'uppercase' },
  verticalDivider: { width: 0.5, height: 60, backgroundColor: '#222' },
  exitBtn: { marginTop: 100, borderBottomWidth: 0.5, borderBottomColor: '#333', paddingBottom: 4 },
  exitText: { color: '#666', fontSize: 9, letterSpacing: 5, fontWeight: '300' },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  footerText: { color: '#444', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});