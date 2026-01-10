import { Platform, PixelRatio, StatusBar } from 'react-native';

// Configurações específicas para manter a estética hacker no Android
export const AndroidFix = {
  // Borda ultra-fina que não "desaparece" no Android
  border: {
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: '#333333',
  },
  // Remove sombras indesejadas que o Android adiciona por padrão
  noElevation: {
    elevation: 0,
    shadowOpacity: 0,
  },
  // Fonte mono para inputs e códigos
  terminalFont: Platform.select({
    android: { fontFamily: 'monospace' },
    ios: { fontFamily: 'Courier' },
  }),
};

// Função para aplicar o StatusBar preto absoluto assim que o app carregar
export const setupStatusBar = () => {
  if (Platform.OS === 'android') {
    StatusBar.setTranslucent(false);
    StatusBar.setBackgroundColor('#000000');
    StatusBar.setBarStyle('light-content');
  }
};