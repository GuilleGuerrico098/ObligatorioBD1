import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const PARTICIPANTES = [
  { id: '41234567', nombre: 'Juan Pérez' },
  { id: '59876543', nombre: 'María García' },
];

function formatDateForHtml(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseHtmlDate(value, current) {
  if (!value) return current || new Date();
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function CrearSancionAdmin() {
  const [participanteId, setParticipanteId] = useState(PARTICIPANTES[0].id);
  const [motivo, setMotivo] = useState('');
  const [duracionDias, setDuracionDias] = useState('');
  const [hasta, setHasta] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChangeDuracion = (texto) => {
    const soloNumeros = texto.replace(/\D/g, '');
    setDuracionDias(soloNumeros);
  };

  const onChangeFecha = (event, selectedDate) => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setHasta(selectedDate);
    }
  };

  const handleSubmit = () => {
    const participante = PARTICIPANTES.find((p) => p.id === participanteId)?.nombre;

    alert(
      `Demo alta sanción\n\nParticipante: ${participante}\nMotivo: ${motivo}\nHasta: ${hasta.toLocaleDateString()}\nDuración (días): ${duracionDias}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nueva sanción</Text>
      <Text style={styles.subtitle}>
        Seleccioná participante, fecha límite de bloqueo y duración en días.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Participante</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={participanteId}
            onValueChange={(v) => setParticipanteId(v)}
          >
            {PARTICIPANTES.map((p) => (
              <Picker.Item
                key={p.id}
                label={`${p.nombre} - CI ${p.id}`}
                value={p.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Ej: Sin asistencia reiterada a reservas"
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Fecha fin de sanción</Text>

        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={formatDateForHtml(hasta)}
            onChange={(e) => setHasta(parseHtmlDate(e.target.value, hasta))}
            style={styles.htmlInput}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputButtonText}>
                {hasta.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={hasta}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={onChangeFecha}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Duración (días)</Text>
        <TextInput
          style={styles.input}
          value={duracionDias}
          onChangeText={handleChangeDuracion}
          keyboardType="numeric"
          placeholder="Ej: 7"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Guardar sanción (demo)</Text>
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputButtonText: {
    fontSize: 14,
    color: '#111827',
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
  htmlInput: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    boxSizing: 'border-box',
  },
});
