import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AdminEstadisticas() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Estadísticas del sistema</Text>
      <Text style={styles.subtitle}>
        Aquí van las consultas SQL del obligatorio (total de reservas, uso por sala,
        bloqueos, etc.). Por ahora es solo interfaz.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Uso de salas</Text>
        <Text style={styles.cardText}>
          Resumen de reservas por sala, edificio y franja horaria.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Participantes con más reservas</Text>
        <Text style={styles.cardText}>
          Top de alumnos/docentes según cantidad de reservas activas o históricas.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Sanciones</Text>
        <Text style={styles.cardText}>
          Listado agregado de sanciones por período, motivo y participante.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>4. Ocupación diaria</Text>
        <Text style={styles.cardText}>
          Porcentaje de ocupación de salas por día / semana.
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#4b5563',
  },
});
