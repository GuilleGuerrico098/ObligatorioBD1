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
import CrearReservaAdmin from './screens/admin/CrearReservaAdmin';
import CrearSalaAdmin from './screens/admin/CrearSalaAdmin';
import CrearSancionAdmin from './screens/admin/CrearSancionAdmin';
import AdminEstadisticas from './screens/admin/AdminEstadisticas';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';

          if (route.name === 'HomeUser') icon = 'home';
          if (route.name === 'CrearReserva') icon = 'add-circle';
          if (route.name === 'MisReservas') icon = 'calendar';
          if (route.name === 'Salas') icon = 'business';

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeUser"
        component={HomeUser}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="CrearReserva"
        component={CrearReserva}
        options={{ title: 'Nueva reserva' }}
      />
      <Tab.Screen
        name="MisReservas"
        component={MisReservas}
        options={{ title: 'Mis reservas' }}
      />
      <Tab.Screen
        name="Salas"
        component={Salas}
        options={{ title: 'Salas' }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <AdminStack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{ headerTitleAlign: 'center' }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Panel administrador' }}
      />
      <AdminStack.Screen
        name="AdminParticipantes"
        component={AdminParticipantes}
        options={{ title: 'Participantes' }}
      />
      <AdminStack.Screen
        name="AdminSalas"
        component={AdminSalas}
        options={{ title: 'Salas' }}
      />
      <AdminStack.Screen
        name="AdminReservas"
        component={AdminReservas}
        options={{ title: 'Reservas' }}
      />
      <AdminStack.Screen
        name="AdminEstadisticas"
        component={AdminEstadisticas}
        options={{ title: 'Estadísticas' }}
      />
      <AdminStack.Screen
        name="AdminSanciones"
        component={AdminSanciones}
        options={{ title: 'Sanciones' }}
      />
      <AdminStack.Screen
        name="AdminCrearParticipante"
        component={CrearParticipanteAdmin}
        options={{ title: 'Nuevo participante' }}
      />
      <AdminStack.Screen
        name="AdminCrearReserva"
        component={CrearReservaAdmin}
        options={{ title: 'Nueva reserva' }}
      />
      <AdminStack.Screen
        name="AdminCrearSala"
        component={CrearSalaAdmin}
        options={{ title: 'Nueva sala' }}
      />
      <AdminStack.Screen
        name="AdminCrearSancion"
        component={CrearSancionAdmin}
        options={{ title: 'Nueva sanción' }}
      />
    </AdminStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserTabs"
          component={UserTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminTabs"
          component={AdminTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
