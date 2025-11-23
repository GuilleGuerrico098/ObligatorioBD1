import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearUsuarioActual } from '../../api';

export default function AdminDashboard({ navigation }) {
  const go = (screen) => navigation.navigate(screen);

  const handleLogout = () => {
    clearUsuarioActual();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel administrador</Text>
      <Text style={styles.subtitle}>
        Gestioná participantes, salas, reservas y sanciones.
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => go('AdminParticipantes')}>
          <Ionicons name="people" size={30} color="#dc2626" />
          <Text style={styles.cardTitle}>Participantes</Text>
          <Text style={styles.cardText}>Alta, baja y modificación.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go('AdminSalas')}>
          <Ionicons name="business" size={30} color="#2563eb" />
          <Text style={styles.cardTitle}>Salas</Text>
          <Text style={styles.cardText}>ABM de salas y edificios.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go('AdminReservas')}>
          <Ionicons name="clipboard" size={30} color="#16a34a" />
          <Text style={styles.cardTitle}>Reservas</Text>
          <Text style={styles.cardText}>Gestión y control de reservas.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go('AdminSanciones')}>
          <Ionicons name="warning" size={30} color="#f97316" />
          <Text style={styles.cardTitle}>Sanciones</Text>
          <Text style={styles.cardText}>Bloqueos por no asistencia.</Text>
        </TouchableOpacity>

        {/* NUEVA CARD: Estadísticas */}
        <TouchableOpacity style={styles.card} onPress={() => go('AdminEstadisticas')}>
          <Ionicons name="stats-chart" size={30} color="#4f46e5" />
          <Text style={styles.cardTitle}>Estadísticas</Text>
          <Text style={styles.cardText}>Consultas del obligatorio.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9f1239',
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 15,
    color: '#111827',
  },
  cardText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  logoutButton: {
    marginTop: 20,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 13,
  },
});
