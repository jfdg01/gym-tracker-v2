import "./global.css";
import { StatusBar } from 'expo-status-bar';

import { StyleSheet, Text, View } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function App() {
  return (

    <GluestackUIProvider mode="dark">
      <View className="flex-1 bg-surface-deep items-center justify-center p-4">
        <Text className="text-black text-xl font-bold text-center">
          NativeWind v4 is working! 🚀
        </Text>
        <Text className="text-red-500 mt-2 text-lg">
          Golden Stack Initialized
        </Text>
        <StatusBar style="light" />
      </View>
    </GluestackUIProvider>

  );
}