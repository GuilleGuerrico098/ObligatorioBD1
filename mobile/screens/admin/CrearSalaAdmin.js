import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const EDIFICIOS = ['Central', 'Pereira', 'Biblioteca', 'Laboratorios'];

export default function CrearSalaAdmin() {
  const [nombre, setNombre] = useState('');
  const [edificio, setEdificio] = useState(EDIFICIOS[0]);
  const [capacidad, setCapacidad] = useState('');
  const [tipo, setTipo] = useState('Uso libre');

  const handleChangeCapacidad = (texto) => {
    const soloNumeros = texto.replace(/\D/g, '');
    setCapacidad(soloNumeros);
  };

  const handleSubmit = () => {
    alert(
      `Demo alta sala\n\nNombre: ${nombre}\nEdificio: ${edificio}\nCapacidad: ${capacidad}\nTipo: ${tipo}`
    );
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
          <Picker selectedValue={edificio} onValueChange={(v) => setEdificio(v)}>
            {EDIFICIOS.map((ed) => (
              <Picker.Item key={ed} label={ed} value={ed} />
            ))}
          </Picker>
        </View>
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
          <Picker selectedValue={tipo} onValueChange={(v) => setTipo(v)}>
            <Picker.Item label="Uso libre" value="Uso libre" />
            <Picker.Item label="Posgrado" value="Posgrado" />
            <Picker.Item label="Docentes" value="Docentes" />
            <Picker.Item label="Reservada" value="Reservada" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Guardar sala (demo)</Text>
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
