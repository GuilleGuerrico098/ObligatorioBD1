import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const SALAS = [
  { id: '1', nombre: 'Sala 101 - Central', tipo: 'Uso libre', capacidad: 4 },
  { id: '2', nombre: 'Sala 203 - Pereira', tipo: 'Exclusiva de posgrado', capacidad: 6 },
  { id: '3', nombre: 'Sala 005 - Biblioteca', tipo: 'Exclusiva de docentes', capacidad: 3 },
];

const PARTICIPANTES = [
  { id: '41234567', nombre: 'Juan Pérez', tipo: 'Estudiante de grado' },
  { id: '59876543', nombre: 'María García', tipo: 'Docente' },
  { id: '43322119', nombre: 'Ana López', tipo: 'Estudiante de posgrado' },
];

// Horas de inicio válidas: de 08:00 a 22:00
const HORAS_INICIO = Array.from({ length: 15 }, (_, i) => 8 + i);

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

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export default function CrearReservaAdmin() {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [salaId, setSalaId] = useState(SALAS[0].id);
  const [horaInicio, setHoraInicio] = useState(8);
  const [duracionHoras, setDuracionHoras] = useState(1);

  const [participanteSeleccionadoId, setParticipanteSeleccionadoId] = useState(
    PARTICIPANTES[0].id
  );
  const [participantesReserva, setParticipantesReserva] = useState([]); // lista de ids

  const onChangeFecha = (event, selectedDate) => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const sala = SALAS.find((s) => s.id === salaId);
  const capacidadSala = sala?.capacidad ?? 0;

  const horaFinNum = horaInicio + duracionHoras;
  const horaFinValida = horaFinNum <= 23;

  const horaFinLabel = horaFinValida
    ? formatHourLabel(horaFinNum)
    : 'Fuera de horario (máx. 23:00)';

  const totalParticipantes = participantesReserva.length;
  const excedeCapacidad =
    capacidadSala > 0 && totalParticipantes > capacidadSala;

  const handleAgregarParticipante = () => {
    if (participantesReserva.includes(participanteSeleccionadoId)) {
      alert('Ese participante ya está agregado a la reserva.');
      return;
    }
    setParticipantesReserva([...participantesReserva, participanteSeleccionadoId]);
  };

  const handleEliminarParticipante = (id) => {
    setParticipantesReserva(
      participantesReserva.filter((pId) => pId !== id)
    );
  };

  const handleSubmit = () => {
    if (!horaFinValida) {
      alert('La reserva debe terminar como máximo a las 23:00.');
      return;
    }
    if (excedeCapacidad) {
      alert(
        `La cantidad de participantes (${totalParticipantes}) supera la capacidad de la sala (${capacidadSala}).`
      );
      return;
    }
    if (totalParticipantes === 0) {
      alert('Agregá al menos un participante a la reserva.');
      return;
    }

    const participantesTexto = participantesReserva
      .map((id) => {
        const p = PARTICIPANTES.find((x) => x.id === id);
        return p ? `• ${p.nombre} - CI ${p.id} (${p.tipo})` : '';
      })
      .join('\n');

    alert(
      `Reserva demo (admin)\n\nFecha: ${fecha.toLocaleDateString()}\nSala: ${
        sala?.nombre
      } (${sala?.tipo}) - Capacidad ${capacidadSala}\nHora inicio: ${formatHourLabel(
        horaInicio
      )}\nDuración: ${duracionHoras} hora(s)\nHora fin: ${horaFinLabel}\n\nParticipantes (${totalParticipantes}):\n${participantesTexto}\n\nMás adelante este formulario va a crear la reserva real, registrar asistencia de cada participante y, si nadie asiste, aplicar automáticamente la sanción de 2 meses.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nueva reserva (admin)</Text>
      <Text style={styles.subtitle}>
        Turnos de 1 hora entre 08:00 y 23:00. Máximo 2 horas seguidas. La
        cantidad de participantes no puede superar la capacidad de la sala.
      </Text>

      {/* Fecha */}
      <View style={styles.field}>
        <Text style={styles.label}>Fecha</Text>

        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={formatDateForHtml(fecha)}
            onChange={(e) => setFecha(parseHtmlDate(e.target.value, fecha))}
            style={styles.htmlInput}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputButtonText}>
                {fecha.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={onChangeFecha}
              />
            )}
          </>
        )}
      </View>

      {/* Sala */}
      <View style={styles.field}>
        <Text style={styles.label}>Sala</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={salaId} onValueChange={(v) => setSalaId(v)}>
            {SALAS.map((s) => (
              <Picker.Item
                key={s.id}
                label={`${s.nombre} (${s.tipo}) - Capacidad ${s.capacidad}`}
                value={s.id}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.helperText}>
          Capacidad actual de la sala: {capacidadSala} participante(s).
        </Text>
      </View>

      {/* Hora inicio */}
      <View style={styles.field}>
        <Text style={styles.label}>Hora de inicio (bloques de 1 hora)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={horaInicio}
            onValueChange={(v) => setHoraInicio(v)}
          >
            {HORAS_INICIO.map((h) => (
              <Picker.Item key={h} label={formatHourLabel(h)} value={h} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Duración */}
      <View style={styles.field}>
        <Text style={styles.label}>Duración</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={duracionHoras}
            onValueChange={(v) => setDuracionHoras(v)}
          >
            <Picker.Item label="1 hora" value={1} />
            <Picker.Item label="2 horas" value={2} />
          </Picker>
        </View>
        <Text style={styles.helperText}>
          Para alumnos en salas de uso libre, luego validaremos también el
          máximo de 2 horas diarias y 3 reservas activas por semana.
        </Text>
      </View>

      {/* Hora fin */}
      <View style={styles.field}>
        <Text style={styles.label}>Hora de fin estimada</Text>
        <View
          style={[
            styles.infoBox,
            !horaFinValida && styles.infoBoxError,
          ]}
        >
          <Text
            style={[
              styles.infoText,
              !horaFinValida && styles.infoTextError,
            ]}
          >
            {horaFinLabel}
          </Text>
        </View>
        {!horaFinValida && (
          <Text style={styles.errorText}>
            Ajustá hora de inicio o duración para terminar como máximo a las
            23:00.
          </Text>
        )}
      </View>

      {/* Participantes */}
      <View style={styles.field}>
        <Text style={styles.label}>Participantes (alumnos y/o docentes)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={participanteSeleccionadoId}
            onValueChange={(v) => setParticipanteSeleccionadoId(v)}
          >
            {PARTICIPANTES.map((p) => (
              <Picker.Item
                key={p.id}
                label={`${p.nombre} - CI ${p.id} (${p.tipo})`}
                value={p.id}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleAgregarParticipante}
        >
          <Text style={styles.secondaryButtonText}>+ Agregar participante</Text>
        </TouchableOpacity>

        <View style={styles.participantsInfo}>
          <Text
            style={[
              styles.participantsCount,
              excedeCapacidad && styles.participantsCountError,
            ]}
          >
            Participantes: {totalParticipantes} / {capacidadSala}
          </Text>
          {excedeCapacidad && (
            <Text style={styles.errorText}>
              La cantidad de participantes supera la capacidad de la sala.
            </Text>
          )}
        </View>

        {participantesReserva.map((id) => {
          const p = PARTICIPANTES.find((x) => x.id === id);
          if (!p) return null;
          return (
            <View key={id} style={styles.participantRow}>
              <Text style={styles.participantText}>
                {p.nombre} - CI {p.id} ({p.tipo})
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleEliminarParticipante(id)}
              >
                <Text style={styles.removeButtonText}>Quitar</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.helperText}>
          Una vez creada la reserva, desde el panel de reservas se registrará la
          asistencia de cada participante. Si ninguno asiste en el día y
          horario, se notificará y se aplicará la sanción de 2 meses sin poder
          reservar.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Guardar reserva (demo)</Text>
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
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  helperText: {
    marginTop: 4,
    fontSize: 11,
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoBoxError: {
    backgroundColor: '#fee2e2',
  },
  infoText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
  },
  infoTextError: {
    color: '#b91c1c',
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
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  participantsInfo: {
    marginTop: 8,
  },
  participantsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  participantsCountError: {
    color: '#b91c1c',
  },
  participantRow: {
    marginTop: 6,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 13,
    color: '#111827',
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
  },
  removeButtonText: {
    fontSize: 11,
    color: '#b91c1c',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: '#b91c1c',
  },
});
