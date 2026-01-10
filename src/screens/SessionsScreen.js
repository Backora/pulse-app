import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Pressable, Animated, Dimensions 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../supabase';
import { translations } from '../translations';

// --- COMPONENTE DE LINHA COM TIMER ---
const SessionLine = ({ item, nickname, navigation, t, lang, ALEX_COLOR }) => {
  const [timeLeft, setTimeLeft] = useState('--:--');

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

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, [item]);

  const isOwner = item.p_creator_id?.toLowerCase() === nickname.toLowerCase();

  return (
    <TouchableOpacity 
      style={styles.sessionLine}
      onPress={() => navigation.navigate('Chat', { 
        nickname, 
        pulseCode: item.pulse_code, 
        isAdmin: isOwner, 
        lang 
      })}
    >
      <View style={styles.lineLeft}>
        <Text style={styles.pulseCode}>{item.pulse_code}</Text>
        <Text style={[styles.roleTag, { color: isOwner ? ALEX_COLOR : '#333' }]}>
          {isOwner ? '// HOST' : '// GUEST'}
        </Text>
      </View>
      <View style={styles.lineRight}>
         <Text style={[styles.timeTag, { color: timeLeft === 'WIPED' ? '#500' : '#333' }]}>
           {timeLeft}
         </Text>
         <View style={[styles.statusDot, { backgroundColor: isOwner ? ALEX_COLOR : '#222' }]} />
      </View>
    </TouchableOpacity>
  );
};

export default function SessionsScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const lang = params.lang || 'en'; // PADRÃO INGLÊS
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const t = translations[lang] || translations['en'];
  const ALEX_COLOR = '#C9C4C4';
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchSessions = async () => {
    try {
      const { data: myPulses } = await supabase.from('pulses').select('*').eq('p_creator_id', nickname);
      const { data: joinedInfo } = await supabase.from('pulse_participants').select('pulses(*)').eq('user_id', nickname);
      
      const joinedPulses = joinedInfo?.map(j => j.pulses).filter(p => p !== null) || [];
      const now = new Date().getTime();
      const combined = [...(myPulses || []), ...joinedPulses];
      
      const uniqueAndValid = combined
        .filter((v, i, a) => v.pulse_code && a.findIndex(t_idx => t_idx.pulse_code === v.pulse_code) === i && new Date(v.expires_at).getTime() > now)
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
    return () => unsubscribe();
  }, [navigation]);

  const handlePanicAction = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      // Deleta pulsos criados pelo operador
      await supabase.from('pulses').delete().eq('p_creator_id', nickname);
      navigation.replace('Login');
    } catch (e) { 
      navigation.replace('Login'); 
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.sessions_title}</Text>
        <Text style={styles.headerSubtitle}>{t.menu_welcome}{nickname.toUpperCase()}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={ALEX_COLOR} />
      ) : (
        <FlatList
          key="single-column-terminal" // Resolve o Invariant Violation
          data={sessions}
          keyExtractor={(item) => item.pulse_code}
          renderItem={({ item }) => (
            <SessionLine 
              item={item} 
              nickname={nickname} 
              navigation={navigation} 
              t={t} 
              lang={lang} 
              ALEX_COLOR={ALEX_COLOR} 
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{t.sessions_empty}</Text>}
        />
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Config', { nickname, lang })}>
            <Text style={[styles.navBtnText, { color: ALEX_COLOR }]}>{t.menu_create}</Text>
          </TouchableOpacity>
          <View style={styles.navDivider} />
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Join', { nickname, lang })}>
            <Text style={styles.navBtnText}>{t.menu_join}</Text>
          </TouchableOpacity>
        </View>

        {/* PANIC MODE SYSTEM */}
        <View style={styles.panicContainer}>
          <Pressable 
            onPressIn={() => Animated.timing(progressAnim, { toValue: 1, duration: 2000, useNativeDriver: false }).start(({finished}) => finished && handlePanicAction())} 
            onPressOut={() => { progressAnim.setValue(0); Animated.timing(progressAnim).stop(); }} 
            style={styles.panicBtn}
          >
            <Text style={styles.panicText}>[ ! ] PANIC_MODE</Text>
            
            <View style={styles.panicProgressBg}>
              <Animated.View style={[
                styles.panicProgressBar, 
                { width: progressAnim.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']}) }
              ]} />
            </View>
            <Text style={styles.panicSubText}>HOLD 2S TO WIPE ALL SESSIONS</Text>
          </Pressable>
        </View>
        
        <Text style={styles.footerBrand}>{t.footer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { marginTop: 80, paddingHorizontal: 40, marginBottom: 40 },
  headerTitle: { color: '#FFF', fontSize: 10, letterSpacing: 8, fontWeight: '300', opacity: 0.8 },
  headerSubtitle: { color: '#333', fontSize: 7, letterSpacing: 3, marginTop: 10 },
  
  list: { paddingHorizontal: 40, paddingBottom: 280 },
  sessionLine: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 0.3,
    borderBottomColor: '#111'
  },
  lineLeft: { flexDirection: 'row', alignItems: 'baseline' },
  pulseCode: { color: '#C9C4C4', fontSize: 18, letterSpacing: 5, fontWeight: '200' },
  roleTag: { fontSize: 7, letterSpacing: 2, marginLeft: 15 },
  
  lineRight: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 12 },
  timeTag: { fontSize: 9, letterSpacing: 2, fontWeight: '300', textAlign: 'right', minWidth: 45 },
  
  empty: { color: '#222', textAlign: 'center', marginTop: 100, fontSize: 8, letterSpacing: 5 },

  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  navButtons: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  navBtn: { paddingHorizontal: 25 },
  navBtnText: { color: '#444', fontSize: 9, letterSpacing: 4, fontWeight: '300' },
  navDivider: { width: 0.5, height: 12, backgroundColor: '#111' },

  panicContainer: { alignItems: 'center', marginBottom: 20 },
  panicBtn: { alignItems: 'center', padding: 10 },
  panicText: { color: '#B00000', fontSize: 10, letterSpacing: 6, fontWeight: '700' },
  panicSubText: { color: '#222', fontSize: 6, letterSpacing: 2, marginTop: 8, fontWeight: '300' },
  panicProgressBg: { width: 140, height: 2, backgroundColor: '#0A0000', marginTop: 12 },
  panicProgressBar: { height: 2, backgroundColor: '#FF0000' },
  
  footerBrand: { color: '#111', fontSize: 7, letterSpacing: 12, marginTop: 5 }
});