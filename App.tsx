import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import '@/global.css';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './drizzle/migrations';
import { db } from '@/src/db/client';

export default function App() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center p-4">
        <Text className="text-red-500 font-bold">Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center p-4">
        <Text className="text-typography-900">Setting up database...</Text>
      </View>
    );
  }

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