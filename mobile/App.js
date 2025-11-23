import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Login from './screens/Login';
import HomeUser from './screens/HomeUser';
import CrearReserva from './screens/CrearReserva';
import MisReservas from './screens/MisReservas';
import Salas from './screens/Salas';

import AdminDashboard from './screens/admin/AdminDashboard';
import AdminParticipantes from './screens/admin/AdminParticipantes';
import AdminReservas from './screens/admin/AdminReservas';
import AdminSalas from './screens/admin/AdminSalas';
import AdminSanciones from './screens/admin/AdminSanciones';

import CrearParticipanteAdmin from './screens/admin/CrearParticipanteAdmin';
import CrearSalaAdmin from './screens/admin/CrearSalaAdmin';
import CrearReservaAdmin from './screens/admin/CrearReservaAdmin';
import CrearSancionAdmin from './screens/admin/CrearSancionAdmin';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#f8fafc' },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Inicio') iconName = 'home';
          if (route.name === 'CrearReserva') iconName = 'add-circle';
          if (route.name === 'MisReservas') iconName = 'calendar';
          if (route.name === 'Salas') iconName = 'business';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeUser} />
      <Tab.Screen
        name="CrearReserva"
        component={CrearReserva}
        options={{ title: 'Crear reserva' }}
      />
      <Tab.Screen
        name="MisReservas"
        component={MisReservas}
        options={{ title: 'Mis reservas' }}
      />
      <Tab.Screen name="Salas" component={Salas} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#f8fafc' },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'speedometer';

          if (route.name === 'Dashboard') iconName = 'speedometer';
          if (route.name === 'AdminParticipantes') iconName = 'people';
          if (route.name === 'AdminReservas') iconName = 'clipboard';
          if (route.name === 'AdminSalas') iconName = 'business';
          if (route.name === 'AdminSanciones') iconName = 'warning';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="AdminParticipantes"
        component={AdminParticipantes}
        options={{ title: 'Participantes' }}
      />
      <Tab.Screen
        name="AdminReservas"
        component={AdminReservas}
        options={{ title: 'Reservas' }}
      />
      <Tab.Screen
        name="AdminSalas"
        component={AdminSalas}
        options={{ title: 'Salas' }}
      />
      <Tab.Screen
        name="AdminSanciones"
        component={AdminSanciones}
        options={{ title: 'Sanciones' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="UserTabs" component={UserTabs} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />

        {/* Formularios de alta admin */}
        <Stack.Screen
          name="AdminCrearParticipante"
          component={CrearParticipanteAdmin}
          options={{ headerShown: true, title: 'Nuevo participante' }}
        />
        <Stack.Screen
          name="AdminCrearSala"
          component={CrearSalaAdmin}
          options={{ headerShown: true, title: 'Nueva sala' }}
        />
        <Stack.Screen
          name="AdminCrearReserva"
          component={CrearReservaAdmin}
          options={{ headerShown: true, title: 'Nueva reserva (admin)' }}
        />
        <Stack.Screen
          name="AdminCrearSancion"
          component={CrearSancionAdmin}
          options={{ headerShown: true, title: 'Nueva sanción' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
