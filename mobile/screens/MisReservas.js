import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { listarReservasPorCi, getUsuarioActual } from '../api';

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargarReservas = async () => {
    const user = getUsuarioActual();
    if (!user || !user.ci) {
      setReservas([]);
      return;
    }

    setCargando(true);
    setError('');
    try {
      const data = await listarReservasPorCi(user.ci);
      setReservas(data || []);
    } catch (e) {
      setError(e.message || 'Error cargando reservas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const renderItem = ({ item }) => {
    const estadoBadgeStyle =
      item.situacion === 'activa'
        ? styles.estadoActiva
        : item.situacion === 'futura'
        ? styles.estadoFutura
        : styles.estadoPasada;

    const estadoTexto =
      item.situacion === 'activa'
        ? 'Activa'
        : item.situacion === 'futura'
        ? 'Futura'
        : 'Pasada';

    const horaLabel = `${item.hora_inicio?.slice(0, 5)} - ${item.hora_fin?.slice(
      0,
      5
    )}`;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sala}>{item.nombre_sala}</Text>
          <Text style={[styles.estado, estadoBadgeStyle]}>{estadoTexto}</Text>
        </View>
        <Text style={styles.line}>{item.fecha}</Text>
        <Text style={styles.line}>{horaLabel}</Text>
        <Text style={styles.line}>Responsable: CI {item.ci_responsable}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reservas</Text>
      <Text style={styles.subtitle}>
        Estas reservas se cargan desde la base filtrando por tu cédula.
      </Text>

      {cargando && reservas.length === 0 ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : reservas.length === 0 ? (
        <Text style={styles.empty}>No tenés reservas registradas.</Text>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => String(item.id_reserva)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 24, marginTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={cargando} onRefresh={cargarReservas} />
          }
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6b7280',
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
    color: '#111827',
  },
  estadoActiva: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  estadoFutura: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  estadoPasada: {
    backgroundColor: '#e5e7eb',
    color: '#4b5563',
  },
  line: {
    fontSize: 13,
    color: '#4b5563',
  },
  error: {
    marginTop: 10,
    textAlign: 'center',
    color: '#b91c1c',
    fontSize: 12,
  },
});
