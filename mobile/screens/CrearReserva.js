import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { obtenerSalas, crearReserva, getUsuarioActual } from '../api';

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

export default function CrearReserva() {
  const usuario = getUsuarioActual();
  const ciResponsable = usuario ? usuario.ci : null;

  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState(null);

  const [horaInicio, setHoraInicio] = useState(8);
  const [duracionHoras, setDuracionHoras] = useState(1);

  const [nuevoParticipanteCI, setNuevoParticipanteCI] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [cargandoSalas, setCargandoSalas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargarSalas() {
      try {
        setCargandoSalas(true);
        const data = await obtenerSalas();
        setSalas(data || []);
        if (data && data.length > 0) {
          const firstId = String(
            data[0].id_sala || data[0].id || data[0].idSala
          );
          setSalaId(firstId);
        }
      } catch (e) {
        alert('Error cargando salas: ' + e.message);
      } finally {
        setCargandoSalas(false);
      }
    }
    cargarSalas();
  }, []);

  const onChangeFecha = (event, selectedDate) => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const salaSeleccionada = salas.find((s) => {
    const id = String(s.id_sala || s.id || s.idSala);
    return id === String(salaId);
  });

  const capacidadSala = salaSeleccionada
    ? Number(
        salaSeleccionada.capacidad ||
          salaSeleccionada.capacidad_maxima ||
          salaSeleccionada.capacidadMaxima ||
          0
      )
    : 0;

  const horaFinNum = horaInicio + duracionHoras;
  const horaFinValida = horaFinNum <= 23;
  const horaFinLabel = horaFinValida
    ? formatHourLabel(horaFinNum)
    : 'Fuera de horario (máx. 23:00)';

  const totalParticipantes = ciResponsable
    ? participantes.length + 1
    : participantes.length;
  const excedeCapacidad =
    capacidadSala > 0 && totalParticipantes > capacidadSala;

  const handleAgregarParticipante = () => {
    const ciLimpia = nuevoParticipanteCI.replace(/\D/g, '');
    if (!ciLimpia) {
      alert('Ingresá una cédula válida (solo números).');
      return;
    }
    if (ciResponsable && ciLimpia === ciResponsable) {
      alert('Esa cédula ya está incluida como responsable.');
      return;
    }
    if (participantes.includes(ciLimpia)) {
      alert('Ese participante ya está en la lista.');
      return;
    }
    setParticipantes([...participantes, ciLimpia]);
    setNuevoParticipanteCI('');
  };

  const handleEliminarParticipante = (ci) => {
    setParticipantes(participantes.filter((p) => p !== ci));
  };

  const handleSubmit = async () => {
    if (!ciResponsable) {
      alert('No hay usuario logueado. Volvé a la pantalla de inicio de sesión.');
      return;
    }
    if (!salaSeleccionada || !salaId) {
      alert('Seleccioná una sala.');
      return;
    }
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

    const fechaStr = fecha.toISOString().slice(0, 10);
    const horaInicioLabel = formatHourLabel(horaInicio);

    const payload = {
      fecha: fechaStr,
      id_sala: Number(salaId),
      hora_inicio: horaInicioLabel,
      duracion_horas: duracionHoras,
      ci_responsable: ciResponsable,
      participantes_ci: [
        ciResponsable,
        ...participantes,
      ],
    };

    try {
      setEnviando(true);
      await crearReserva(payload);
      alert('Reserva creada correctamente en la base de datos.');
      setParticipantes([]);
    } catch (e) {
      alert('Error creando reserva: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Nueva reserva</Text>
      <Text style={styles.subtitle}>
        Turnos de 1 hora entre 08:00 y 23:00. Máximo 2 horas seguidas. La
        cantidad de participantes no puede superar la capacidad de la sala.
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

      <View style={styles.field}>
        <Text style={styles.label}>Sala</Text>
        {cargandoSalas ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={salaId}
              onValueChange={(itemValue) => setSalaId(itemValue)}
            >
              {salas.map((s) => {
                const id = String(s.id_sala || s.id || s.idSala);
                const nombre = s.nombre_sala || s.nombre || s.nombreSala;
                const tipo = s.tipo || s.tipo_sala || '';
                const cap =
                  s.capacidad ||
                  s.capacidad_maxima ||
                  s.capacidadMaxima ||
                  '';
                return (
                  <Picker.Item
                    key={id}
                    label={`${nombre} (${tipo}) - Capacidad ${cap}`}
                    value={id}
                  />
                );
              })}
            </Picker>
          </View>
        )}
        <Text style={styles.helperText}>
          Capacidad actual de la sala: {capacidadSala} participante(s).
        </Text>
      </View>

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
          No se pueden reservar más de 2 horas seguidas por día.
        </Text>
      </View>

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
            Ajustá la hora de inicio o la duración para que la sala se libere a
            más tardar a las 23:00.
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Participantes (alumnos y/o docentes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Cédula del participante (incluí también la tuya)"
          value={nuevoParticipanteCI}
          onChangeText={(t) => setNuevoParticipanteCI(t.replace(/\D/g, ''))}
          keyboardType="numeric"
        />
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

        {ciResponsable && (
          <View style={styles.participantRow}>
            <Text style={styles.participantText}>
              CI {ciResponsable} (responsable)
            </Text>
          </View>
        )}

        {participantes.map((ci) => (
          <View key={ci} style={styles.participantRow}>
            <Text style={styles.participantText}>CI {ci}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleEliminarParticipante(ci)}
            >
              <Text style={styles.removeButtonText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.helperText}>
          Más adelante se registrará la asistencia de cada participante. Si
          ninguno se presenta, se aplicará la sanción correspondiente.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSubmit}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#f9fafb" />
        ) : (
          <Text style={styles.primaryButtonText}>Guardar reserva</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
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
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoBoxError: {
    backgroundColor: '#fee2e2',
  },
  infoText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  infoTextError: {
    color: '#b91c1c',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#f9fafb',
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
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
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
