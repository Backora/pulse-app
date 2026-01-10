import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';
import { translations } from '../translations'; 

export default function MenuScreen({ route, navigation }) {
  // HERANÇA: Pega o nick e a língua que vieram do Login
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const lang = params.lang || 'pt'; // Recupera a língua escolhida
  
  const [loading, setLoading] = useState(false);
  const t = translations[lang] || translations['pt'];
  const ALEX_COLOR = '#C9C4C4';

  // Função para desconectar e apagar TUDO (Panic) - TRADUZIDA
  const handleDisconnect = () => {
    Alert.alert(
      t.panic_title || "CONFIRM_DISCONNECT",
      t.panic_msg || "Sair apagará o teu perfil e todas as sessões ativas permanentemente. Continuar?",
      [
        { text: t.panic_abort || "ABORT", style: "cancel" },
        { 
          text: t.panic_confirm || "WIPE_AND_EXIT", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.rpc('panic', { p_user_id: nickname });
              if (error) throw error;
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
        
        {/* Identificação do Operador - TRADUZIDO */}
        <View style={styles.headerBox}>
          <Text style={styles.operatorLabel}>{t.menu_welcome}{nickname.toUpperCase()}</Text>
          <View style={[styles.statusLine, { backgroundColor: ALEX_COLOR }]} />
        </View>

        {/* Core do Menu */}
        <View style={styles.menuWrapper}>
          <View style={styles.menuRow}>
            
            {/* CRIAR: Passa lang para a próxima tela */}
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => navigation.navigate('Config', { nickname, lang })}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>CREATE</Text>
              <Text style={styles.menuDesc}>{t.menu_create}</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            {/* JOIN: Passa lang para a próxima tela */}
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => navigation.navigate('Join', { nickname, lang })}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>JOIN</Text>
              <Text style={styles.menuDesc}>{t.menu_join}</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Botão de Terminar - TRADUZIDO */}
        <TouchableOpacity 
          onPress={handleDisconnect} 
          style={[styles.exitBtn, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text style={styles.exitText}>{t.chat_leave}</Text>
          )}
        </TouchableOpacity>

        {/* Footer - TRADUZIDO */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.footer}</Text>
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
  menuDesc: { color: '#555', fontSize: 7, letterSpacing: 3, marginTop: 12, textTransform: 'uppercase', textAlign: 'center' },
  verticalDivider: { width: 0.5, height: 60, backgroundColor: '#222' },
  exitBtn: { marginTop: 100, borderBottomWidth: 0.5, borderBottomColor: '#333', paddingBottom: 4 },
  exitText: { color: '#666', fontSize: 9, letterSpacing: 5, fontWeight: '300' },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  footerText: { color: '#444', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});