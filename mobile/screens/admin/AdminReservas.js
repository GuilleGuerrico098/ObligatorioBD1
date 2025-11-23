import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const MOCK_RESERVAS = [
  { id: '1', sala: 'Sala 101', fecha: '2025-11-20', turno: '10:00-12:00', estado: 'Activa' },
  { id: '2', sala: 'Sala 005', fecha: '2025-11-18', turno: '19:00-21:00', estado: 'Sin asistencia' },
];

export default function AdminReservas({ navigation }) {
  const handleFakeAction = (accion) => {
    alert(`Interfaz de ${accion} de reserva.\nDespués conectamos con el backend.`);
  };

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
          onPress={() => handleFakeAction('modificación')}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => handleFakeAction('baja')}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        data={MOCK_RESERVAS}
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
