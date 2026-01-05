import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  Alert, ActivityIndicator 
} from 'react-native';
import { supabase } from '../supabase';

export default function ChatScreen({ route, navigation }) {
  const { nickname, pulseCode } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  // 1. INICIALIZAÇÃO E REALTIME
  useEffect(() => {
    fetchMessages();

    // Escuta novas mensagens em tempo real usando pulse_id
    const channel = supabase
      .channel(`pulse_chat_${pulseCode}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `pulse_id=eq.${pulseCode}` 
      }, (payload) => {
        // Adiciona a nova mensagem à lista
        setMessages(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // CARREGAR MENSAGENS COM A NOVA COLUNA created_at
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('pulse_id', pulseCode)
      .order('created_at', { ascending: false }); // Agora já funciona!
    
    if (error) console.error('Erro ao carregar:', error.message);
    if (data) setMessages(data);
  };

  // 2. ENVIAR MENSAGEM
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { error } = await supabase
      .from('messages')
      .insert([{
        pulse_id: pulseCode,
        sender: nickname,
        content: newMessage,
      }]);

    if (error) {
      Alert.alert("Erro", "Falha ao enviar mensagem.");
      console.log("Erro no envio:", error.message);
    } else {
      setNewMessage('');
    }
  };

  // 3. FUNÇÃO KILL (CHAMA A RPC delete_pulse)
  const handleDeletePulse = async () => {
    Alert.alert(
      "CONFIRMAR DESTRUIÇÃO",
      "Vais eliminar este Pulse e todas as mensagens para sempre. Confirmar?",
      [
        { text: "CANCELAR", style: "cancel" },
        { 
          text: "KILL", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.rpc('delete_pulse', { 
                p_pulse_code: pulseCode 
              });

              if (error) throw error;

              Alert.alert("ERASED", "Rastro eliminado com sucesso.");
              navigation.navigate('Login');
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "O servidor recusou a limpeza.");
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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>PULSE: {pulseCode}</Text>
          <Text style={styles.headerSubtitle}>ENCRYPTED CONNECTION</Text>
        </View>

        <TouchableOpacity onPress={handleDeletePulse} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#FF4444" /> : 
          <Text style={styles.killBtn}>KILL</Text>}
        </TouchableOpacity>
      </View>

      {/* LISTA DE CHAT */}
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
            <Text style={styles.msgText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.chatList}
      />

      {/* INPUT */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="WRITE A MESSAGE..."
            placeholderTextColor="#222"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25, 
    borderBottomWidth: 1, borderBottomColor: '#0A0A0A', 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { color: '#C9C4C4', fontSize: 10, fontWeight: '900', letterSpacing: 4 },
  headerSubtitle: { color: '#1A1A1A', fontSize: 7, letterSpacing: 2, marginTop: 4 },
  backIcon: { color: '#C9C4C4', fontSize: 20 },
  killBtn: { color: '#FF4444', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  
  chatList: { paddingHorizontal: 20, paddingVertical: 30 },
  msgContainer: { marginBottom: 25, maxWidth: '85%' },
  myMsg: { alignSelf: 'flex-end', borderRightWidth: 1, borderRightColor: '#C9C4C4', paddingRight: 15 },
  theirMsg: { alignSelf: 'flex-start', borderLeftWidth: 1, borderLeftColor: '#222', paddingLeft: 15 },
  senderName: { color: '#1A1A1A', fontSize: 7, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  msgText: { color: '#C9C4C4', fontSize: 13, lineHeight: 20 },

  inputArea: { 
    flexDirection: 'row', padding: 25, borderTopWidth: 1, borderTopColor: '#0A0A0A', 
    alignItems: 'center', backgroundColor: '#000', paddingBottom: Platform.OS === 'ios' ? 40 : 25 
  },
  input: { flex: 1, color: '#C9C4C4', fontSize: 12, letterSpacing: 1, maxHeight: 100 },
  sendBtn: { marginLeft: 15 },
  sendBtnText: { color: '#C9C4C4', fontSize: 10, fontWeight: '900', letterSpacing: 2 }
});