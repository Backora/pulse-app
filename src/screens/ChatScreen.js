import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  Alert, ActivityIndicator 
} from 'react-native';
import { supabase } from '../supabase';

export default function ChatScreen({ route, navigation }) {
  const params = route.params || {};
  const nickname = params.nickname || 'OPERATOR';
  const pulseCode = params.pulseCode || '---';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const ALEX_COLOR = '#C9C4C4';
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`pulse_chat_${pulseCode}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `pulse_id=eq.${pulseCode}` 
      }, (payload) => {
        setMessages(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pulseCode]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('pulse_id', pulseCode)
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    const { error } = await supabase.from('messages').insert([{
      pulse_id: pulseCode, sender: nickname, content: newMessage,
    }]);
    if (!error) setNewMessage('');
  };

  // MUDANÇA AQUI: Agora volta para 'Sessions' em vez de 'Login'
  const handleDeletePulse = async () => {
    Alert.alert("CONFIRMAR DESTRUIÇÃO", "Eliminar rastro permanentemente?", [
      { text: "CANCEL", style: "cancel" },
      { text: "KILL", style: "destructive", onPress: async () => {
        setLoading(true);
        try {
          await supabase.rpc('delete_pulse', { p_pulse_code: pulseCode });
          // MUDADO: Navega de volta para a lista de chats/sessões
          navigation.navigate('Sessions', { nickname });
        } catch (e) {
          console.error(e);
          // Mesmo se der erro no delete, voltamos para as sessões para não travar
          navigation.navigate('Sessions', { nickname });
        } finally {
          setLoading(false);
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Ícone de voltar também leva para Sessions */}
        <TouchableOpacity onPress={() => navigation.navigate('Sessions', { nickname })}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: ALEX_COLOR }]}>{pulseCode}</Text>
          <Text style={styles.headerSubtitle}>ENCRYPTED_PULSE</Text>
        </View>

        <TouchableOpacity onPress={handleDeletePulse} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#600" /> : <Text style={styles.killBtn}>KILL</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        inverted
        renderItem={({ item }) => (
          <View style={[
            styles.msgContainer, 
            item.sender === nickname ? styles.myMsg : styles.theirMsg
          ]}>
            <Text style={styles.senderName}>{item.sender.toUpperCase()}</Text>
            <Text style={[styles.msgText, { color: item.sender === nickname ? ALEX_COLOR : '#A0A0A0' }]}>
              {item.content}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.chatList}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={20}>
        <View style={styles.inputArea}>
          <TextInput
            style={[styles.input, { color: ALEX_COLOR }]}
            placeholder="TYPE_MESSAGE..."
            placeholderTextColor="#444"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={[styles.sendText, { color: ALEX_COLOR }]}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 30, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A'
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 12, letterSpacing: 6, fontWeight: '200' },
  headerSubtitle: { color: '#666', fontSize: 7, letterSpacing: 3, marginTop: 4 },
  backIcon: { color: '#666', fontSize: 18 },
  killBtn: { color: '#800', fontSize: 9, letterSpacing: 2, fontWeight: '400' },
  chatList: { paddingHorizontal: 30, paddingVertical: 20 },
  msgContainer: { marginBottom: 30, maxWidth: '90%' },
  myMsg: { 
    alignSelf: 'flex-end', 
    alignItems: 'flex-end',
    borderRightWidth: 1, 
    borderRightColor: '#C9C4C4', 
    paddingRight: 15 
  },
  theirMsg: { 
    alignSelf: 'flex-start', 
    borderLeftWidth: 1, 
    borderLeftColor: '#333',
    paddingLeft: 15 
  },
  senderName: { color: '#666', fontSize: 7, letterSpacing: 2, marginBottom: 8 },
  msgText: { fontSize: 14, fontWeight: '300', letterSpacing: 1, lineHeight: 22 },
  inputArea: { 
    flexDirection: 'row', 
    paddingHorizontal: 30, 
    paddingVertical: 20,
    borderTopWidth: 0.5, 
    borderTopColor: '#1A1A1A', 
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 30 : 10
  },
  input: { flex: 1, fontSize: 13, letterSpacing: 1, fontWeight: '300' },
  sendBtn: { marginLeft: 20 },
  sendText: { fontSize: 10, letterSpacing: 3, fontWeight: '300' }
});