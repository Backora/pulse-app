import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Importa as tuas telas
import LoginScreen from './src/screens/LoginScreen';
import ConfigPage from './src/screens/ConfigPage';
import ChatScreen from './src/screens/ChatScreen'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* StatusBar preta para combinar com o design Blackora */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,           // Remove a barra de topo padrão
          animationEnabled: true,       // Mantém as transições suaves
          cardStyle: { backgroundColor: '#000' } // Garante fundo preto em tudo
        }}
      >
        {/* Tela 1: Nickname e Escolha Inicial */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Tela 2: Configurações de Duração (Presets 1h, 24h, 7d) */}
        <Stack.Screen name="Config" component={ConfigPage} />

        {/* Tela 3: Onde a conversa acontece */}
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}