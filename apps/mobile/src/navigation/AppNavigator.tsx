import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CheckinScreen from '../screens/checkin/CheckinScreen';
import RankingScreen from '../screens/ranking/RankingScreen';
import DesafiosScreen from '../screens/desafios/DesafiosScreen';
import PremiosScreen from '../screens/premios/PremiosScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 8, height: 60 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Feed', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
      <Tab.Screen name="Checkin" component={CheckinScreen} options={{ tabBarLabel: 'Check-in', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📷</Text> }} />
      <Tab.Screen name="Ranking" component={RankingScreen} options={{ tabBarLabel: 'Ranking', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text> }} />
      <Tab.Screen name="Desafios" component={DesafiosScreen} options={{ tabBarLabel: 'Desafios', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚡</Text> }} />
      <Tab.Screen name="Premios" component={PremiosScreen} options={{ tabBarLabel: 'Prêmios', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎁</Text> }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAuthStore((s) => s.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
