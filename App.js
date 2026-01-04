import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa os teus ecrãs
import LoginScreen from './src/screens/LoginScreen';
// Nota: Se ainda não criaste o ChatScreen.js na pasta screens, cria um básico!
import ChatScreen from './src/screens/ChatScreen'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: false, // Mantém o visual limpo sem barras no topo
          animationEnabled: true // Para as transições serem suaves
        }}
      >
        {/* Definimos as "rotas" da app */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}