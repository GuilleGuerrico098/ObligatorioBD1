import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarSalas } from '../../api';

export default function AdminSalas({ navigation }) {
  const [salas, setSalas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await listarSalas();

      const formateadas = data.map((s) => ({
        id: String(s.id_sala),
        nombre: s.nombre_sala,
        edificio: s.nombre_edificio,
        capacidad: s.capacidad,
        tipo:
          s.tipo === 'uso_libre'
            ? 'Uso libre'
            : s.tipo === 'exclusiva_posgrado'
            ? 'Posgrado'
            : s.tipo === 'exclusiva_docente'
            ? 'Docentes'
            : s.tipo,
      }));

      setSalas(formateadas);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  const handleFakeAction = (accion, item) => {
    Alert.alert(
      `Interfaz de ${accion}`,
      `Sala: ${item.nombre}\nDespués se conecta con el backend.`
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.line}>{item.edificio}</Text>
      <Text style={styles.line}>Capacidad: {item.capacidad} personas</Text>
      <Text style={styles.tipo}>{item.tipo}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => handleFakeAction('modificación', item)}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => handleFakeAction('baja', item)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (salas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ABM de salas</Text>
        <Text style={styles.subtitle}>No hay salas registradas.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AdminCrearSala')}
        >
          <Text style={styles.primaryButtonText}>+ Nueva sala</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABM de salas</Text>
      <Text style={styles.subtitle}>
        Administración de salas de estudio por edificio.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AdminCrearSala')}
      >
        <Text style={styles.primaryButtonText}>+ Nueva sala</Text>
      </TouchableOpacity>

      <FlatList
        data={salas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 24, marginTop: 12 }}
      />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9f1239',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fef2f2',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    elevation: 1,
  },
  nombre: {
    fontWeight: '600',
    fontSize: 15,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  btnEdit: {
    backgroundColor: '#e0f2fe',
  },
  btnDelete: {
    backgroundColor: '#fee2e2',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});
