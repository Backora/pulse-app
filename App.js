import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar'; // Controle da barra inferior

// Importa as tuas telas
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen'; 
import ConfigPage from './src/screens/ConfigPage';
import ChatScreen from './src/screens/ChatScreen'; 
import SessionsScreen from './src/screens/SessionsScreen';
import JoinScreen from './src/screens/JoinScreen';

const Stack = createStackNavigator();

export default function App() {
  
  useEffect(() => {
    // Configurações específicas para Android manter o look "Pure Black"
    if (Platform.OS === 'android') {
      const prepareSystemUI = async () => {
        // 1. Força a barra de navegação (botões de baixo) a ficar preta e sem bordas nativas
        await NavigationBar.setBackgroundColorAsync('#000000');
        await NavigationBar.setButtonStyleAsync('light'); // Ícones brancos
      };
      prepareSystemUI();
    }
  }, []);

  return (
    <NavigationContainer>
      {/* 2. StatusBar Translucid: Impede que o Android crie aquela faixa cinza no topo */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          // 3. Garante que o fundo entre trocas de tela seja sempre preto absoluto
          cardStyle: { backgroundColor: '#000' },
          // 4. Melhora a performance de transição no Android
          detachPreviousScreen: !Platform.OS === 'android' 
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Config" component={ConfigPage} />
        <Stack.Screen name="Sessions" component={SessionsScreen} /> 
        <Stack.Screen name="Join" component={JoinScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}