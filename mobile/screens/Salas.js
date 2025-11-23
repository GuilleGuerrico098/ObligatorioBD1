import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { obtenerSalas } from '../api';

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const data = await obtenerSalas();
        setSalas(data || []);
      } catch (e) {
        alert('Error cargando salas: ' + e.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const renderItem = ({ item }) => {
    const nombre = item.nombre_sala || item.nombre || item.nombreSala || '';
    const edificio = item.nombre_edificio || item.edificio || '';
    const capacidad =
      item.capacidad || item.capacidad_maxima || item.capacidadMaxima || '';
    const tipo = item.tipo || item.tipo_sala || '';

    return (
      <View style={styles.card}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.line}>{edificio}</Text>
        <Text style={styles.line}>Capacidad: {capacidad} personas</Text>
        <Text style={styles.tipo}>{tipo}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas</Text>
      <Text style={styles.subtitle}>
        Listado de salas cargado desde la base de datos.
      </Text>

      {cargando ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={salas}
          keyExtractor={(item, index) =>
            String(item.id_sala || item.id || item.idSala || index)
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
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
