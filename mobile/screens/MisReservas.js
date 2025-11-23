import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const MOCK_RESERVAS = [
  {
    id: '1',
    sala: 'Sala 101',
    edificio: 'Central',
    fecha: '2025-11-20',
    hora: '10:00 - 12:00',
    estado: 'Activa',
  },
  {
    id: '2',
    sala: 'Sala 203',
    edificio: 'Pereira',
    fecha: '2025-11-18',
    hora: '08:00 - 10:00',
    estado: 'Finalizada',
  },
  {
    id: '3',
    sala: 'Sala 005',
    edificio: 'Biblioteca',
    fecha: '2025-11-15',
    hora: '19:00 - 21:00',
    estado: 'Sin asistencia',
  },
];

export default function MisReservas() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.sala}>{item.sala}</Text>
        <Text style={[styles.estado, styles[`estado_${item.estado}`]]}>
          {item.estado}
        </Text>
      </View>
      <Text style={styles.line}>{item.edificio}</Text>
      <Text style={styles.line}>{item.fecha}</Text>
      <Text style={styles.line}>{item.hora}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reservas</Text>
      <Text style={styles.subtitle}>
        Más adelante estos datos vendrán desde la API filtrando por tu usuario.
      </Text>

      <FlatList
        data={MOCK_RESERVAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
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
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sala: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  estado: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  estado_Activa: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  estado_Finalizada: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  line: {
    fontSize: 13,
    color: '#4b5563',
  },
});
