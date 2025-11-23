import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { clearUsuarioActual } from '../api';

export default function HomeUser({ navigation }) {
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
      <Text style={styles.title}>Salas de Estudio UCU</Text>
      <Text style={styles.subtitle}>Versión participante</Text>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => go('CrearReserva')}
        >
          <Text style={styles.primaryButtonText}>Crear reserva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => go('MisReservas')}
        >
          <Text style={styles.secondaryButtonText}>Ver mis reservas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => go('Salas')}
        >
          <Text style={styles.secondaryButtonText}>Ver salas</Text>
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
    backgroundColor: '#0f172a',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#f9fafb',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 13,
  },
});
