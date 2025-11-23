import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { listarSalas, listarParticipantes, crearReserva } from '../../api';

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

export default function CrearReservaAdmin({ navigation }) {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState(null);

  const [participantesSistema, setParticipantesSistema] = useState([]);
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState(null);

  const [horaInicio, setHoraInicio] = useState(8);
  const [duracionHoras, setDuracionHoras] = useState(1);

  const [participantesReserva, setParticipantesReserva] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const dataSalas = await listarSalas();
        setSalas(dataSalas);
        if (dataSalas.length > 0) {
          setSalaId(String(dataSalas[0].id_sala));
        }

        const dataPart = await listarParticipantes();
        setParticipantesSistema(dataPart);
        if (dataPart.length > 0) {
          setParticipanteSeleccionado(dataPart[0].ci);
        }
      } catch (e) {
        Alert.alert("Error", e.message);
      }
    }

    cargar();
  }, []);

  const onChangeFecha = (event, selectedDate) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const sala = salas.find((s) => String(s.id_sala) === String(salaId));
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
    if (!participanteSeleccionado) return;

    if (participantesReserva.includes(participanteSeleccionado)) {
      Alert.alert("Error", "Ese participante ya está en la lista.");
      return;
    }

    setParticipantesReserva([...participantesReserva, participanteSeleccionado]);
  };

  const handleEliminarParticipante = (ci) => {
    setParticipantesReserva(
      participantesReserva.filter((p) => p !== ci)
    );
  };

  async function handleSubmit() {
    if (!horaFinValida) {
      Alert.alert("Error", "La reserva debe terminar antes de las 23:00.");
      return;
    }

    if (excedeCapacidad) {
      Alert.alert(
        "Error",
        `La sala soporta ${capacidadSala} personas y estás agregando ${totalParticipantes}.`
      );
      return;
    }

    if (totalParticipantes === 0) {
      Alert.alert("Error", "Agrega al menos un participante.");
      return;
    }

    const fechaStr = fecha.toISOString().slice(0, 10);
    const horaStr = `${String(horaInicio).padStart(2, '0')}:00`;

    const payload = {
      fecha: fechaStr,
      id_sala: parseInt(salaId, 10),
      hora_inicio: horaStr,
      duracion_horas: duracionHoras,
      ci_responsable: participantesReserva[0],
      participantes_ci: participantesReserva,
    };

    try {
      setGuardando(true);
      await crearReserva(payload);
      Alert.alert("Éxito", "Reserva creada correctamente.", [
        {
          text: "OK",
          onPress: () => navigation.navigate('AdminDashboard'),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nueva reserva (admin)</Text>
      <Text style={styles.subtitle}>
        Turnos de 1 hora entre 08:00 y 23:00. Máximo 2 horas seguidas. 
      </Text>

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
              <Text style={styles.inputButtonText}>{fecha.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="calendar"
                onChange={onChangeFecha}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sala</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={salaId} onValueChange={setSalaId}>
            {salas.map((s) => (
              <Picker.Item
                key={s.id_sala}
                label={`${s.nombre_sala} (${s.tipo}) - Capacidad ${s.capacidad}`}
                value={String(s.id_sala)}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.helperText}>
          Capacidad de la sala: {capacidadSala}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Hora de inicio</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={horaInicio} onValueChange={setHoraInicio}>
            {HORAS_INICIO.map((h) => (
              <Picker.Item key={h} label={formatHourLabel(h)} value={h} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Duración</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={duracionHoras} onValueChange={setDuracionHoras}>
            <Picker.Item label="1 hora" value={1} />
            <Picker.Item label="2 horas" value={2} />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Hora fin estimada</Text>

        <View style={[styles.infoBox, !horaFinValida && styles.infoBoxError]}>
          <Text style={[styles.infoText, !horaFinValida && styles.infoTextError]}>
            {horaFinLabel}
          </Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Participantes</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={participanteSeleccionado}
            onValueChange={setParticipanteSeleccionado}
          >
            {participantesSistema.map((p) => (
              <Picker.Item
                key={p.ci}
                label={`${p.nombre} ${p.apellido} - CI ${p.ci}`}
                value={p.ci}
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

        {participantesReserva.map((ci) => {
          const p = participantesSistema.find((x) => x.ci === ci);
          if (!p) return null;

          return (
            <View key={ci} style={styles.participantRow}>
              <Text style={styles.participantText}>
                {p.nombre} {p.apellido} - CI {p.ci}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleEliminarParticipante(ci)}
              >
                <Text style={styles.removeButtonText}>Quitar</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSubmit}
        disabled={guardando}
      >
        <Text style={styles.primaryButtonText}>
          {guardando ? 'Guardando...' : 'Guardar reserva'}
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
  htmlInput: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
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
  primaryButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fef2f2',
    fontWeight: '600',
    fontSize: 15,
  },
});
