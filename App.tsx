import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import '@/global.css';

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <View className="flex-1 bg-background-dark items-center justify-center p-4">
        <Heading size="2xl" className="text-typography-900 mb-4">
          Golden Stack Active ⚡
        </Heading>

        <Button
          size="lg"
          variant="solid"
          action="primary"
          className="bg-primary-500 rounded-full"
          onPress={() => console.log('Button Pressed!')}
        >
          <ButtonText>Test Gluestack Component</ButtonText>
        </Button>

        <StatusBar style="light" />
      </View>
    </GluestackUIProvider>
  );
}