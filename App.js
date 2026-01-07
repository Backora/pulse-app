import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Importa as tuas telas
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen'; 
import ConfigPage from './src/screens/ConfigPage';
import ChatScreen from './src/screens/ChatScreen'; 
import SessionsScreen from './src/screens/SessionsScreen'; // 1. ADICIONADO O IMPORT

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: '#000' }
        }}
      >
        {/* Tela 1: Apenas Nickname */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Tela 2: Onde escolhe Criar ou Entrar */}
        <Stack.Screen name="Menu" component={MenuScreen} />

        {/* Tela 3: Configurações de Duração */}
        <Stack.Screen name="Config" component={ConfigPage} />

        {/* Tela 4: Lista de Sessões (A que estava a faltar) */}
        <Stack.Screen name="Sessions" component={SessionsScreen} /> 

        {/* Tela 5: Onde a conversa acontece */}
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}