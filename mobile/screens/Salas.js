import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const MOCK_SALAS = [
  { id: '1', nombre: 'Sala 101', edificio: 'Central', capacidad: 6, tipo: 'Uso libre' },
  { id: '2', nombre: 'Sala 203', edificio: 'Pereira', capacidad: 8, tipo: 'Exclusiva posgrado' },
  { id: '3', nombre: 'Sala 005', edificio: 'Biblioteca', capacidad: 4, tipo: 'Exclusiva docentes' },
];

export default function Salas() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.line}>{item.edificio}</Text>
      <Text style={styles.line}>Capacidad: {item.capacidad} personas</Text>
      <Text style={styles.tipo}>{item.tipo}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas</Text>
      <Text style={styles.subtitle}>
        Información de ejemplo de salas por edificio, tipo y capacidad.
      </Text>

      <FlatList
        data={MOCK_SALAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  line: {
    fontSize: 13,
    color: '#4b5563',
  },
  tipo: {
    marginTop: 4,
    fontSize: 12,
    color: '#4338ca',
    fontWeight: '500',
  },
});
