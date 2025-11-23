import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { crearSala } from '../../api';

const EDIFICIOS = ['Central', 'Pereira', 'Biblioteca', 'Laboratorios'];

export default function CrearSalaAdmin({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [edificio, setEdificio] = useState(EDIFICIOS[0]);
  const [piso, setPiso] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [tipo, setTipo] = useState('Uso libre');
  const [guardando, setGuardando] = useState(false);

  const handleChangeCapacidad = (texto) => {
    const soloNumeros = texto.replace(/\D/g, '');
    setCapacidad(soloNumeros);
  };

  const handleChangePiso = (texto) => {
    const soloNumeros = texto.replace(/\D/g, '');
    setPiso(soloNumeros);
  };

  const mapTipoBackend = (t) => {
    if (t === 'Uso libre') return 'uso_libre';
    if (t === 'Posgrado') return 'exclusiva_posgrado';
    if (t === 'Docentes') return 'exclusiva_docente';
    return 'uso_libre';
  };

  const handleSubmit = async () => {
    if (!nombre || !edificio || !piso || !capacidad || !tipo) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }

    const pisoNum = parseInt(piso, 10);
    const capNum = parseInt(capacidad, 10);

    if (isNaN(pisoNum) || pisoNum <= 0) {
      Alert.alert('Error', 'Ingresá un piso válido.');
      return;
    }

    if (isNaN(capNum) || capNum <= 0) {
      Alert.alert('Error', 'Ingresá una capacidad válida.');
      return;
    }

    const tipoBackend = mapTipoBackend(tipo);

    const payload = {
      nombre_sala: nombre,
      nombre_edificio: edificio,
      piso: pisoNum,
      capacidad: capNum,
      tipo: tipoBackend,
    };

    try {
      setGuardando(true);
      await crearSala(payload);
      Alert.alert('Éxito', 'Sala creada correctamente.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('AdminDashboard');
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nueva sala</Text>
      <Text style={styles.subtitle}>
        Capacidad solo con números y edificio como lista de selección.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre de sala</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Sala 101"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Edificio</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={edificio} onValueChange={setEdificio}>
            {EDIFICIOS.map((ed) => (
              <Picker.Item key={ed} label={ed} value={ed} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Piso</Text>
        <TextInput
          style={styles.input}
          value={piso}
          onChangeText={handleChangePiso}
          keyboardType="numeric"
          placeholder="Ej: 1"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Capacidad (personas)</Text>
        <TextInput
          style={styles.input}
          value={capacidad}
          onChangeText={handleChangeCapacidad}
          keyboardType="numeric"
          placeholder="Ej: 6"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={tipo} onValueChange={setTipo}>
            <Picker.Item label="Uso libre" value="Uso libre" />
            <Picker.Item label="Posgrado" value="Posgrado" />
            <Picker.Item label="Docentes" value="Docentes" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={guardando}>
        <Text style={styles.primaryButtonText}>
          {guardando ? 'Guardando...' : 'Guardar sala'}
        </Text>
      </TouchableOpacity>
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
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fef2f2',
    fontWeight: '600',
    fontSize: 15,
  },
});
