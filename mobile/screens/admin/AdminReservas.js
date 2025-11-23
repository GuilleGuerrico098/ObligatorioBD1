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
import { listarReservasAdmin } from '../../api';

export default function AdminReservas({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);

      const data = await listarReservasAdmin();

      const formateadas = data.map((r) => ({
        id: String(r.id_reserva),
        sala: r.nombre_sala,
        fecha: r.fecha,
        turno: `${r.hora_inicio.slice(0, 5)} - ${r.hora_fin.slice(0, 5)}`,
        estado:
          r.estado === 'activa'
            ? 'Activa'
            : r.estado === 'cancelada'
            ? 'Cancelada'
            : 'Finalizada',
      }));

      setReservas(formateadas);
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.sala}>{item.sala}</Text>
      <Text style={styles.line}>
        {item.fecha} • {item.turno}
      </Text>
      <Text style={styles.line}>Estado: {item.estado}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() =>
            Alert.alert('Editar', `Función editar reserva #${item.id} (pendiente)`)
          }
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() =>
            Alert.alert('Eliminar', `Función borrar reserva #${item.id} (pendiente)`)
          }
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

  if (reservas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ABM de reservas</Text>
        <Text style={styles.subtitle}>No hay reservas registradas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABM de reservas</Text>
      <Text style={styles.subtitle}>
        Administrá todas las reservas según las reglas del negocio.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AdminCrearReserva')}
      >
        <Text style={styles.primaryButtonText}>+ Nueva reserva</Text>
      </TouchableOpacity>

      <FlatList
        data={reservas}
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
  sala: {
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
