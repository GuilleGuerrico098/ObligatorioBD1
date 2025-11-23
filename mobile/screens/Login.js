import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Login({ navigation }) {
  const handleUserLogin = () => {
    navigation.replace('UserTabs');
  };

  const handleAdminLogin = () => {
    navigation.replace('AdminTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas de Estudio UCU</Text>
      <Text style={styles.subtitle}>Sistema de reservas</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingresá</Text>
        <Text style={styles.cardText}>
          Más adelante acá va el login real (correo y contraseña contra la API).
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleUserLogin}>
          <Text style={styles.primaryButtonText}>Entrar como participante</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleAdminLogin}>
          <Text style={styles.secondaryButtonText}>Entrar como administrador</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Versión demo - solo interfaz</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
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
    borderColor: '#9ca3af',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 15,
  },
  footer: {
    marginTop: 24,
    color: '#9ca3af',
    fontSize: 12,
  },
});
