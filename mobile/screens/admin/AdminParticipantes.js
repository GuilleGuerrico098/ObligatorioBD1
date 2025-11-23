import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarParticipantes, borrarParticipante } from '../../api';

export default function AdminParticipantes({ navigation }) {
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const mapTipoHumano = (t) => {
    if (t === 'grado') return 'Alumno';
    if (t === 'posgrado') return 'Posgrado';
    if (t === 'docente') return 'Docente';
    return t;
  };

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await listarParticipantes();

      const formateados = data.map((p) => ({
        ci: p.ci,
        nombre: `${p.nombre} ${p.apellido}`,
        rol: mapTipoHumano(p.tipo),
        programa: '—',
      }));

      setParticipantes(formateados);
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

  const handleEliminar = (ci) => {
    Alert.alert(
      'Eliminar participante',
      `¿Seguro que querés eliminar al participante CI ${ci}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await borrarParticipante(ci);
              setParticipantes((prev) => prev.filter((p) => p.ci !== ci));
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
      'Editar participante',
      `Función pendiente para ${item.nombre}.`
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.line}>CI: {item.ci}</Text>
      <Text style={styles.line}>
        {item.rol} - {item.programa}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => handleEditar(item)}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => handleEliminar(item.ci)}
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

  if (participantes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ABM de participantes</Text>
        <Text style={styles.subtitle}>No hay participantes registrados.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AdminCrearParticipante')}
        >
          <Text style={styles.primaryButtonText}>+ Nuevo participante</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABM de participantes</Text>
      <Text style={styles.subtitle}>
        Alta, baja y modificación de alumnos y docentes.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AdminCrearParticipante')}
      >
        <Text style={styles.primaryButtonText}>+ Nuevo participante</Text>
      </TouchableOpacity>

      <FlatList
        data={participantes}
        keyExtractor={(item) => item.ci}
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
