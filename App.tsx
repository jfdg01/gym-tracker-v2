import "./global.css";
import { StatusBar } from 'expo-status-bar';

import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-surface-deep items-center justify-center p-4">
      <Text className="text-white text-xl font-bold text-center">
        NativeWind v4 is working! 🚀
      </Text>
      <Text className="text-red-500 mt-2 text-lg">
        Golden Stack Initialized
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

