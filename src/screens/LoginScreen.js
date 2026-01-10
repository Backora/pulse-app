import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
  ActivityIndicator, Alert, Animated 
} from 'react-native';
import { supabase } from '../supabase';
import { translations } from '../translations';

export default function LoginScreen({ navigation }) {
  // PADRÃO DEFINIDO PARA INGLÊS ('en')
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en'); 
  
  // ANIMAÇÃO DE CONTEÚDO
  const contentOpacity = useRef(new Animated.Value(1)).current;
  
  const t = translations[lang] || translations['en']; 
  const ALEX_COLOR = '#C9C4C4';

  const changeLang = (newLang) => {
    if (newLang === lang) return;

    // Efeito visual de troca de sistema
    Animated.sequence([
      Animated.timing(contentOpacity, { toValue: 0.4, duration: 100, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();

    setLang(newLang);
  };

  const handleAccess = async () => {
    if (nickname.length <= 2) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('register_user', {
        p_username: nickname, 
        p_avatar_url: '' 
      });
      if (error) throw error;
      
      // Passa a língua escolhida para o resto da app
      navigation.navigate('Menu', { nickname, lang });
    } catch (error) {
      console.error("Erro no acesso:", error);
      Alert.alert(t.err_title, t.err_msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        
        {/* SELETOR DE LÍNGUAS (HEADER) */}
        <View style={styles.langModule}>
          <Text style={styles.moduleLabel}>SYSTEM_LANG // </Text>
          <View style={styles.langOptions}>
            {['en', 'pt', 'es'].map((l) => (
              <TouchableOpacity 
                key={l} 
                onPress={() => changeLang(l)} 
                style={styles.langBtn}
              >
                <Text style={[
                  styles.langText, 
                  lang === l && { color: ALEX_COLOR, opacity: 1 }
                ]}>
                  {l.toUpperCase()}
                </Text>
                {lang === l && <View style={[styles.activeIndicator, { backgroundColor: ALEX_COLOR }]} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.inner}
        >
          <Animated.View style={[styles.contentWrapper, { opacity: contentOpacity }]}>
            
            <View style={styles.logoWrapper}>
              <Text style={[styles.logo, { color: ALEX_COLOR }]}>P U L S E</Text>
              <Text style={styles.subLogo}>{t.sub_logo}</Text> 
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                style={[styles.input, { color: ALEX_COLOR }]}
                placeholder={t.placeholder}
                placeholderTextColor="#222"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={ALEX_COLOR}
                cursorColor={ALEX_COLOR}
                editable={!loading}
              />
              
              <TouchableOpacity 
                style={[styles.button, { opacity: nickname.length > 2 && !loading ? 1 : 0 }]}
                onPress={handleAccess}
                disabled={nickname.length <= 2 || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={ALEX_COLOR} />
                ) : (
                  <Text style={[styles.buttonText, { color: ALEX_COLOR }]}>{t.btn_access}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t.footer}</Text>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  langModule: { 
    position: 'absolute', top: 60, left: 40, right: 40, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 10, borderBottomWidth: 0.3, borderBottomColor: '#111', zIndex: 10
  },
  moduleLabel: { color: '#333', fontSize: 7, letterSpacing: 2 },
  langOptions: { flexDirection: 'row' },
  langBtn: { marginLeft: 20, alignItems: 'center' },
  langText: { color: '#1A1A1A', fontSize: 9, letterSpacing: 3, fontWeight: '300' },
  activeIndicator: { width: 4, height: 1, marginTop: 4 },

  inner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentWrapper: { width: '100%', alignItems: 'center', padding: 40 },

  logoWrapper: { alignItems: 'center', marginBottom: 80 },
  logo: { fontSize: 24, fontWeight: '100', letterSpacing: 22, textAlign: 'center', paddingLeft: 22 },
  subLogo: { color: '#444', fontSize: 7, letterSpacing: 6, textAlign: 'center', marginTop: 15 },
  
  inputContainer: { width: '100%', alignItems: 'center' },
  input: { 
    width: '80%', fontSize: 13, letterSpacing: 5, paddingVertical: 15, 
    textAlign: 'center', fontWeight: '300', borderBottomWidth: 0.3, borderBottomColor: '#111' 
  },
  button: { marginTop: 50, paddingVertical: 10, paddingHorizontal: 30, minHeight: 40, justifyContent: 'center' },
  buttonText: { fontSize: 10, letterSpacing: 10, fontWeight: '300' },
  
  footer: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  footerText: { color: '#1A1A1A', fontSize: 8, letterSpacing: 10 }
});