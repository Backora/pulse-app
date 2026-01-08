import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions, Pressable, Animated 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

const PulseCard = ({ item, nickname, navigation }) => {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const ALEX_COLOR = '#C9C4C4';

  useEffect(() => {
    const updateTimer = () => {
      const expiry = new Date(item.expires_at).getTime();
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
      onPress={() => navigation.navigate('Chat', { nickname, pulseCode: item.pulse_code })}
    >
      <Text style={styles.cardCode}>{item.pulse_code}</Text>
      <Text style={styles.cardHost}>HOST: {item.created_by?.toUpperCase() || 'UNKNOWN'}</Text>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>{timeLeft}</Text>
        <View style={[styles.statusDot, { backgroundColor: timeLeft === 'WIPED' ? '#500' : '#333' }]} />
      </View>
    </TouchableOpacity>
  );
};

export default function SessionsScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panicLoading, setPanicLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const hapticTimer = useRef(null);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_active_pulses', { p_user_id: nickname });
      if (!error) setSessions(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSessions();
    const sub = supabase.channel('p').on('postgres_changes', {event:'*', schema:'public', table:'pulses'}, fetchSessions).subscribe();
    return () => {
      supabase.removeChannel(sub);
      if (hapticTimer.current) clearTimeout(hapticTimer.current);
    };
  }, []);

  const handlePanicAction = async () => {
    if (hapticTimer.current) clearTimeout(hapticTimer.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setPanicLoading(true);
    try {
      await supabase.rpc('panic', { p_user_id: nickname });
      navigation.replace('Login');
    } catch (e) {
      setPanicLoading(false);
    }
  };

  const handlePressIn = () => {
    let duration = 3000;
    let elapsed = 0;
    let currentInterval = 400; // Começa com pulsação lenta (sutil)

    const runHaptic = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      elapsed += currentInterval;
      // Acelera a frequência: diminui o intervalo de 400ms para 50ms progressivamente
      currentInterval = Math.max(50, 400 - (elapsed / duration) * 350);

      if (elapsed < duration) {
        hapticTimer.current = setTimeout(runHaptic, currentInterval);
      }
    };

    runHaptic();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handlePanicAction();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1.5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1.5, duration: 50, useNativeDriver: true }),
      ])
    ).start();
  };

  const handlePressOut = () => {
    if (hapticTimer.current) clearTimeout(hapticTimer.current);
    Animated.timing(progressAnim).stop();
    Animated.timing(shakeAnim).stop();
    progressAnim.setValue(0);
    shakeAnim.setValue(0);
  };

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ACTIVE_SIGNALS</Text>
        <View style={[styles.headerLine, { backgroundColor: ALEX_COLOR }]} />
        <Text style={styles.headerSubtitle}>OP: {nickname.toUpperCase()}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#111" />
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
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('Config', { nickname })}>
          <Text style={[styles.newBtnText, { color: ALEX_COLOR }]}>+ INITIALIZE_NEW_PULSE</Text>
        </TouchableOpacity>

        <View style={styles.panicContainer}>
          <Pressable 
            onPressIn={handlePressIn} 
            onPressOut={handlePressOut}
            style={styles.panicBtn}
          >
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <Text style={styles.panicText}>
                {panicLoading ? "WIPING..." : "HOLD TO EXECUTE PANIC"}
              </Text>
            </Animated.View>
            <View style={styles.panicProgressBg}>
              <Animated.View style={[styles.panicProgressBar, { width: barWidth }]} />
            </View>
          </Pressable>
        </View>
        
        <Text style={styles.backoraLogo}>BY BACKORA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { marginTop: 80, alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: '#FFF', fontSize: 14, letterSpacing: 8, fontWeight: '200' },
  headerLine: { width: 30, height: 1, marginTop: 10, opacity: 0.5 },
  headerSubtitle: { color: '#444', fontSize: 8, letterSpacing: 3, marginTop: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 220 },
  row: { justifyContent: 'center' },
  card: { backgroundColor: '#050505', width: (width - 60) / 2, margin: 8, padding: 18, borderWidth: 0.5, borderColor: '#111', alignItems: 'center' },
  cardCode: { color: '#C9C4C4', fontSize: 14, letterSpacing: 3, fontWeight: '300' },
  cardHost: { color: '#333', fontSize: 7, letterSpacing: 1, marginTop: 6 },
  cardDivider: { width: '40%', height: 0.5, backgroundColor: '#111', marginVertical: 14 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardTime: { color: '#555', fontSize: 9, letterSpacing: 1, marginRight: 6 },
  statusDot: { width: 3, height: 3, borderRadius: 1.5 },
  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  newBtn: { marginBottom: 25 },
  newBtnText: { fontSize: 9, letterSpacing: 3 },
  panicContainer: { width: '100%', alignItems: 'center', height: 70 },
  panicBtn: { padding: 10, alignItems: 'center' },
  panicText: { color: '#800', fontSize: 9, letterSpacing: 5, fontWeight: 'bold' },
  panicProgressBg: { width: 140, height: 1, backgroundColor: '#111', marginTop: 12 },
  panicProgressBar: { height: 1, backgroundColor: '#F00' },
  backoraLogo: { color: '#222', fontSize: 7, letterSpacing: 8, marginTop: 10 },
  empty: { color: '#222', textAlign: 'center', marginTop: 100, letterSpacing: 5, fontSize: 10 }
});