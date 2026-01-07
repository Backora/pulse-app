import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { supabase } from '../supabase';

export default function SessionsScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [panicLoading, setPanicLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_active_pulses', { 
        p_user_id: nickname 
      });
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Erro RPC Sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const channel = supabase
      .channel('pulses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulses' }, () => {
        fetchActiveSessions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePanic = () => {
    Alert.alert(
      "PROTOCOL: PANIC",
      "Confirmar autodestruição total?",
      [
        { text: "CANCEL", style: "cancel" },
        { 
          text: "EXECUTE", 
          style: "destructive",
          onPress: async () => {
            setPanicLoading(true);
            try {
              await supabase.rpc('panic', { p_user_id: nickname });
              navigation.replace('Login'); 
            } catch (error) {
              Alert.alert("FAIL", "Protocolo interrompido.");
            } finally {
              setPanicLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={() => navigation.navigate('Chat', { nickname, pulseCode: item.pulse_code })}
    >
      <View>
        <Text style={[styles.pulseCode, { color: ALEX_COLOR }]}>{item.pulse_code}</Text>
        <Text style={styles.pulseDate}>
          STATUS: ACTIVE | {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER COM BOTÃO DE CRIAR NOVO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ACTIVE_SESSIONS</Text>
          <Text style={styles.operatorText}>OPERATOR: {nickname}</Text>
        </View>
        
        {/* BOTÃO PARA CRIAR NOVO PULSE */}
        <TouchableOpacity 
          style={styles.newPulseBtn}
          onPress={() => navigation.navigate('Config', { nickname })}
        >
          <Text style={[styles.newPulseText, { color: ALEX_COLOR }]}>+ NEW_SIGNAL</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color={ALEX_COLOR} /></View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.pulse_code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchActiveSessions();}} tintColor={ALEX_COLOR} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>NO_ACTIVE_PULSE</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Config', { nickname })}>
                <Text style={[styles.emptyLink, { color: ALEX_COLOR }]}>INITIALIZE_FIRST_PULSE</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* PANIC BUTTON */}
      <TouchableOpacity 
        style={styles.panicBtn}
        onPress={handlePanic}
        disabled={panicLoading}
      >
        {panicLoading ? (
          <ActivityIndicator size="small" color="#F00" />
        ) : (
          <Text style={styles.panicText}>[ ! ] PANIC_PROTOCOL</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    paddingTop: 80, 
    paddingHorizontal: 30, 
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerTitle: { color: '#FFF', fontSize: 14, letterSpacing: 8, fontWeight: '200' },
  operatorText: { color: '#444', fontSize: 8, letterSpacing: 4, marginTop: 15 },
  
  newPulseBtn: {
    borderWidth: 0.5,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: -5
  },
  newPulseText: { fontSize: 8, letterSpacing: 2 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 30, paddingBottom: 120 },
  
  sessionCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 25, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#1A1A1A' 
  },
  pulseCode: { fontSize: 16, letterSpacing: 5, fontWeight: '300' },
  pulseDate: { color: '#333', fontSize: 7, letterSpacing: 2, marginTop: 6 },
  arrow: { color: '#222', fontSize: 18 },

  emptyContainer: { alignItems: 'center', marginTop: 120 },
  emptyText: { color: '#222', fontSize: 10, letterSpacing: 5 },
  emptyLink: { fontSize: 8, letterSpacing: 3, marginTop: 20, textDecorationLine: 'underline' },

  panicBtn: { 
    position: 'absolute', 
    bottom: 50, 
    alignSelf: 'center',
    padding: 20,
  },
  panicText: { color: '#800', fontSize: 9, letterSpacing: 6, fontWeight: 'bold' }
});