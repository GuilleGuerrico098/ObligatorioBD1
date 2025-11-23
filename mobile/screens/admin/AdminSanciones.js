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
import { listarSanciones, borrarSancion } from '../../api';

export default function AdminSanciones({ navigation }) {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarSanciones = async () => {
    try {
      setCargando(true);
      const data = await listarSanciones();

      const formateadas = data.map((s) => ({
        id: String(s.id_sancion),
        participante:
          s.nombre && s.apellido
            ? `${s.nombre} ${s.apellido}`
            : s.ci
            ? `CI ${s.ci}`
            : 'Participante',
        motivo: s.motivo,
        hasta: s.fecha_fin,
      }));

      setSanciones(formateadas);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarSanciones();
    }, [])
  );

  const handleEliminar = (id) => {
    Alert.alert(
      'Eliminar sanción',
      '¿Seguro que querés eliminar esta sanción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await borrarSancion(parseInt(id, 10));
              setSanciones((prev) => prev.filter((s) => s.id !== id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleEditar = (item) => {
    Alert.alert(
      'Editar sanción',
      `Función de edición pendiente para la sanción de ${item.participante}.`
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.participante}</Text>
      <Text style={styles.line}>Motivo: {item.motivo}</Text>
      <Text style={styles.line}>Bloqueo hasta: {item.hasta}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => handleEditar(item)}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => handleEliminar(item.id)}
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

  if (sanciones.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ABM de sanciones</Text>
        <Text style={styles.subtitle}>No hay sanciones registradas.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AdminCrearSancion')}
        >
          <Text style={styles.primaryButtonText}>+ Nueva sanción</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABM de sanciones</Text>
      <Text style={styles.subtitle}>
        Gestión de bloqueos por no asistencia y otros motivos.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AdminCrearSancion')}
      >
        <Text style={styles.primaryButtonText}>+ Nueva sanción</Text>
      </TouchableOpacity>

      <FlatList
        data={sanciones}
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
