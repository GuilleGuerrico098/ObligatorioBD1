import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { setUsuarioActual } from '../api';

const USUARIOS = [
  {
    correo: 'alumno@ucu.edu.uy',
    contrasena: 'alumno123',
    nombre: 'Alumno Demo',
    ci: '55325342',
    tipo: 'alumno',
    esAdmin: false,
  },
  {
    correo: 'admin@ucu.edu.uy',
    contrasena: 'admin123',
    nombre: 'Admin Demo',
    ci: '41234567',
    tipo: 'admin',
    esAdmin: true,
  },
];

export default function Login({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = () => {
    const correoTrim = correo.trim().toLowerCase();
    const user = USUARIOS.find(
      (u) =>
        u.correo.toLowerCase() === correoTrim &&
        u.contrasena === contrasena
    );

    if (!user) {
      alert('Correo o contraseña incorrectos.');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      setUsuarioActual(user);
      if (user.esAdmin) {
        navigation.replace('AdminTabs');
      } else {
        navigation.replace('UserTabs');
      }
      setCargando(false);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salas de Estudio UCU</Text>
      <Text style={styles.subtitle}>Sistema de reservas</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingresá</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#f9fafb" />
          ) : (
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.examplesCard}>
        <Text style={styles.examplesTitle}>Usuarios de ejemplo</Text>
        <Text style={styles.examplesLine}>
          Alumno → correo: alumno@ucu.edu.uy / contraseña: alumno123
        </Text>
        <Text style={styles.examplesLine}>
          Admin → correo: admin@ucu.edu.uy / contraseña: admin123
        </Text>
        <Text style={styles.examplesNote}>
          El alumno entra a la versión participante, el admin al panel de
          administración.
        </Text>
      </View>

      <Text style={styles.footer}>Versión conectada a la API de reservas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#f9fafb',
    fontWeight: '600',
    fontSize: 15,
  },
  examplesCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 16,
  },
  examplesTitle: {
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 6,
  },
  examplesLine: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  examplesNote: {
    marginTop: 6,
    color: '#9ca3af',
    fontSize: 11,
  },
  footer: {
    marginTop: 18,
    color: '#9ca3af',
    fontSize: 12,
  },
});
