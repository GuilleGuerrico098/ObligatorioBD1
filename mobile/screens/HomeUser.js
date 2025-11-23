import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeUser({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola 👋</Text>
      <Text style={styles.subtitle}>
        Desde acá podés gestionar tus reservas de salas de estudio.
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CrearReserva')}
        >
          <Ionicons name="add-circle" size={32} color="#2563eb" />
          <Text style={styles.cardTitle}>Crear reserva</Text>
          <Text style={styles.cardText}>
            Elegí sala, día, turnos y participantes.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('MisReservas')}
        >
          <Ionicons name="calendar" size={32} color="#16a34a" />
          <Text style={styles.cardTitle}>Mis reservas</Text>
          <Text style={styles.cardText}>
            Consultá tus reservas activas y pasadas.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.card, styles.fullWidthCard]}
        onPress={() => navigation.navigate('Salas')}
      >
        <Ionicons name="business" size={32} color="#7c3aed" />
        <Text style={styles.cardTitle}>Ver salas disponibles</Text>
        <Text style={styles.cardText}>
          Listado de salas por edificio, capacidad y tipo.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  fullWidthCard: {
    marginTop: 4,
  },
  cardTitle: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  cardText: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
});
