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

export default function CrearParticipanteAdmin() {
  const [ci, setCi] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('Alumno');
  const [programa, setPrograma] = useState('');

  const handleChangeCi = (texto) => {
    const soloNumeros = texto.replace(/\D/g, '');
    setCi(soloNumeros);
  };

  const handleSubmit = () => {
    alert(
      `Demo alta participante\n\nCI: ${ci}\nNombre: ${nombre}\nRol: ${rol}\nPrograma: ${programa}\nCorreo: ${correo}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nuevo participante</Text>
      <Text style={styles.subtitle}>
        La CI admite solo números. Más adelante se validará contra la base de datos.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Cédula</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={ci}
          onChangeText={handleChangeCi}
          placeholder="Ej: 41234567"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre y apellido"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Correo institucional</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          placeholder="usuario@ucu.edu.uy"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Rol</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={rol} onValueChange={(v) => setRol(v)}>
            <Picker.Item label="Alumno" value="Alumno" />
            <Picker.Item label="Docente" value="Docente" />
            <Picker.Item label="Administrador" value="Administrador" />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Programa / carrera</Text>
        <TextInput
          style={styles.input}
          value={programa}
          onChangeText={setPrograma}
          placeholder="Ej: Ingeniería en Informática"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Guardar participante (demo)</Text>
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
