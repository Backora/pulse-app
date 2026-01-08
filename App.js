import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Importa as tuas telas
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen'; 
import ConfigPage from './src/screens/ConfigPage';
import ChatScreen from './src/screens/ChatScreen'; 
import SessionsScreen from './src/screens/SessionsScreen';
import JoinScreen from './src/screens/JoinScreen'; // Importe corrigido aqui

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
        {/* Tela 1: Entrada/Identificação */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Tela 2: Dashboard principal (onde está o CREATE e JOIN) */}
        <Stack.Screen name="Menu" component={MenuScreen} />

        {/* Tela 3: Definição do tempo do Pulse */}
        <Stack.Screen name="Config" component={ConfigPage} />

        {/* Tela 4: Lista de sessões ativas */}
        <Stack.Screen name="Sessions" component={SessionsScreen} /> 

        {/* Tela 5: Introdução do código para entrar (Join) */}
        <Stack.Screen name="Join" component={JoinScreen} />

        {/* Tela 6: Onde as mensagens desaparecem */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}