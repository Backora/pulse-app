import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Dimensions, Pressable, Animated 
} from 'react-native';
// 1. SafeAreaView para gerenciar Notch e barras de navegação
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

const PulseCard = ({ item, nickname, navigation }) => {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const ALEX_COLOR = '#C9C4C4';
  
  // Lógica de Identidade: Usando a coluna que o Alex confirmou (p_creator_id)
  const creator = item.p_creator_id || 'UNKNOWN';
  const isOwner = creator.toLowerCase() === nickname.toLowerCase();

  useEffect(() => {
    const updateTimer = () => {
      const expiryDate = item.expires_at;
      if (!expiryDate) return;
      
      const expiry = new Date(expiryDate).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeLeft('WIPED');
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    };
    const t = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(t);
  }, [item]);

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        // SEGURANÇA: Garante que entras como Admin se o pulso for teu
        navigation.navigate('Chat', { 
          nickname, 
          pulseCode: item.pulse_code,
          isAdmin: isOwner 
        });
      }}
    >
      <Text style={styles.cardCode}>{item.pulse_code}</Text>
      <Text style={[styles.cardHost, { color: isOwner ? ALEX_COLOR : '#444' }]}>
        {isOwner ? 'ROLE: HOST' : `FROM: ${creator.toUpperCase()}`}
      </Text>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>{timeLeft}</Text>
        <View style={[styles.statusDot, { backgroundColor: isOwner ? ALEX_COLOR : '#333' }]} />
      </View>
    </TouchableOpacity>
  );
};

export default function SessionsScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const ALEX_COLOR = '#C9C4C4';
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchSessions = async () => {
    try {
      // 1. Busca pulses onde és o criador
      const { data: myPulses } = await supabase
        .from('pulses')
        .select('*')
        .eq('p_creator_id', nickname);

      // 2. Busca pulses onde entraste (Join)
      const { data: joinedInfo } = await supabase
        .from('pulse_participants')
        .select('pulse_code, pulses(*)')
        .eq('user_id', nickname);

      const joinedPulses = joinedInfo?.map(j => j.pulses).filter(p => p !== null) || [];
      
      // 3. Combina e remove expirados/duplicados
      const now = new Date().getTime();
      const combined = [...(myPulses || []), ...joinedPulses];
      
      const uniqueAndValid = combined
        .filter((v, i, a) => 
          v.pulse_code && 
          a.findIndex(t => t.pulse_code === v.pulse_code) === i && // Único
          new Date(v.expires_at).getTime() > now // Não expirado
        )
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setSessions(uniqueAndValid);
    } catch (e) {
      console.log("FETCH_ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const unsubscribe = navigation.addListener('focus', fetchSessions);

    // Sync em tempo real para quando o Alex criar algo ou tu apagares
    const channel = supabase.channel('global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulses' }, fetchSessions)
      .subscribe();

    return () => {
      unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigation]);

  const handlePanicAction = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      // Apaga todos os teus sinais ativos
      await supabase.from('pulses').delete().eq('p_creator_id', nickname);
      navigation.replace('Login');
    } catch (e) {
      navigation.replace('Login');
    }
  };

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ACTIVE_SIGNALS</Text>
        <View style={[styles.headerLine, { backgroundColor: ALEX_COLOR }]} />
        <Text style={styles.headerSubtitle}>OP: {nickname.toUpperCase()}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={ALEX_COLOR} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.pulse_code}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <PulseCard item={item} nickname={nickname} navigation={navigation} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>NO_SIGNALS_FOUND</Text>}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.newBtn} 
          onPress={() => navigation.navigate('Config', { nickname })}
          activeOpacity={0.7}
        >
          <Text style={[styles.newBtnText, { color: ALEX_COLOR }]}>+ INITIALIZE_NEW_PULSE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate('Join', { nickname })}>
          <Text style={styles.joinBtnText}>SYNC_EXISTING_SIGNAL</Text>
        </TouchableOpacity>

        <View style={styles.panicContainer}>
          <Pressable 
            onPressIn={() => Animated.timing(progressAnim, { toValue: 1, duration: 2000, useNativeDriver: false }).start(({finished}) => finished && handlePanicAction())} 
            onPressOut={() => { progressAnim.setValue(0); Animated.timing(progressAnim).stop(); }} 
            style={styles.panicBtn}
          >
            <Text style={styles.panicText}>HOLD TO EXECUTE PANIC</Text>
            <View style={styles.panicProgressBg}>
              <Animated.View style={[styles.panicProgressBar, { width: barWidth }]} />
            </View>
          </Pressable>
        </View>
        <Text style={styles.backoraLogo}>BY BACKORA</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  header: { 
    marginTop: Platform.OS === 'android' ? 20 : 40, 
    alignItems: 'center', 
    marginBottom: 30 
  },
  headerTitle: { color: '#FFF', fontSize: 14, letterSpacing: 8, fontWeight: '200' },
  headerLine: { width: 30, height: 1, marginTop: 10, opacity: 0.5 },
  headerSubtitle: { color: '#444', fontSize: 8, letterSpacing: 3, marginTop: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 250 },
  row: { justifyContent: 'center' },
  card: { 
    backgroundColor: '#050505', 
    width: (width - 60) / 2, 
    margin: 8, 
    padding: 18, 
    borderWidth: 0.5, 
    borderColor: '#111', 
    alignItems: 'center',
    elevation: 0, // Garante que o Android não coloque sombra nos cards
  },
  cardCode: { color: '#C9C4C4', fontSize: 14, letterSpacing: 3, fontWeight: '300' },
  cardHost: { fontSize: 7, letterSpacing: 1, marginTop: 6 },
  cardDivider: { width: '40%', height: 0.5, backgroundColor: '#111', marginVertical: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardTime: { color: '#555', fontSize: 9, letterSpacing: 1, marginRight: 6 },
  statusDot: { width: 3, height: 3, borderRadius: 1.5 },
  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  newBtn: { marginBottom: 15 },
  newBtnText: { fontSize: 9, letterSpacing: 3 },
  joinBtn: { marginBottom: 25 },
  joinBtnText: { color: '#444', fontSize: 8, letterSpacing: 3 },
  panicContainer: { width: '100%', alignItems: 'center' },
  panicBtn: { padding: 10, alignItems: 'center' },
  panicText: { color: '#800', fontSize: 9, letterSpacing: 5, fontWeight: 'bold' },
  panicProgressBg: { width: 140, height: 1, backgroundColor: '#111', marginTop: 12 },
  panicProgressBar: { height: 1, backgroundColor: '#F00' },
  backoraLogo: { color: '#222', fontSize: 7, letterSpacing: 8, marginTop: 10 },
  empty: { color: '#222', textAlign: 'center', marginTop: 100, letterSpacing: 5, fontSize: 10 }
});