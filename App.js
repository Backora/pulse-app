import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';

// Importa as tuas telas
import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen'; 
import ConfigPage from './src/screens/ConfigPage';
import ChatScreen from './src/screens/ChatScreen'; 
import SessionsScreen from './src/screens/SessionsScreen';
import JoinScreen from './src/screens/JoinScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    // O SafeAreaView com fundo #000 evita que o conteúdo vaze ou 
    // fique com cores diferentes nas bordas do Android
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        {/* backgroundColor="#000" garante o preto absoluto na barra de status */}
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />

        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
            cardStyle: { backgroundColor: '#000' }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Mantém o minimalismo visual em toda a estrutura
  },
});