import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
// 1. Importação para gerenciar áreas de corte (Notch/Navigation Bar)
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

export default function MenuScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const [loading, setLoading] = useState(false);
  
  const ALEX_COLOR = '#C9C4C4';

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
    // 2. SafeAreaView como root para evitar que o ID ou Footer fiquem cortados
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        
        {/* Identificação do Operador */}
        <View style={styles.headerBox}>
          <Text style={styles.operatorLabel}>ID // {nickname.toUpperCase()}</Text>
          <View style={[styles.statusLine, { backgroundColor: ALEX_COLOR }]} />
        </View>

        {/* Core do Menu */}
        <View style={styles.menuWrapper}>
          <View style={styles.menuRow}>
            
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => navigation.navigate('Config', { nickname })}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>CREATE</Text>
              <Text style={styles.menuDesc}>New Session</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity 
              style={styles.menuOption}
              onPress={() => navigation.navigate('Join', { nickname })}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuTitle, { color: ALEX_COLOR }]}>JOIN</Text>
              <Text style={styles.menuDesc}>Intercept</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Botão de Terminar com borda minimalista HD */}
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
  headerBox: { 
    position: 'absolute', 
    top: Platform.OS === 'android' ? 20 : 60, 
    left: 40 
  },
  operatorLabel: { color: '#666', fontSize: 8, letterSpacing: 4, fontWeight: '300' },
  statusLine: { width: 20, height: 1, marginTop: 8, opacity: 0.5 },
  menuWrapper: { 
    width: '100%', 
    height: 150, 
    justifyContent: 'center' 
  },
  menuRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  menuOption: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  menuTitle: { 
    fontSize: 14, 
    fontWeight: '200', 
    letterSpacing: 10,
    // Ajuste para centralizar texto com letterSpacing alto
    paddingLeft: 10 
  },
  menuDesc: { color: '#555', fontSize: 7, letterSpacing: 3, marginTop: 12, textTransform: 'uppercase' },
  // Divisor vertical ultra-fino
  verticalDivider: { width: 0.5, height: 60, backgroundColor: '#1A1A1A' },
  exitBtn: { 
    marginTop: 100, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#333', 
    paddingBottom: 4,
    ...Platform.select({
      android: { elevation: 0 },
      ios: { shadowOpacity: 0 }
    })
  },
  exitText: { color: '#666', fontSize: 9, letterSpacing: 5, fontWeight: '300' },
  footer: { 
    position: 'absolute', 
    bottom: Platform.OS === 'android' ? 20 : 40, 
    alignItems: 'center' 
  },
  footerText: { color: '#444', fontSize: 8, letterSpacing: 10, fontWeight: '300' }
});