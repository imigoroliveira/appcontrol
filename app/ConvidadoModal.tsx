import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Convidado {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
}

interface ConvidadoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (convidado: Convidado) => void;
  convidado?: Convidado;
}

export default function ConvidadoModal({ visible, onClose, onSave, convidado }: ConvidadoModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (convidado) {
      setNome(convidado.nome);
      setEmail(convidado.email);
      setTelefone(convidado.telefone);
    } else {
      setNome('');
      setEmail('');
      setTelefone('');
    }
  }, [convidado]);

  const handleSave = () => {
    if (!nome || !email || !telefone) {
      return;
    }

    onSave({
      id: convidado?.id,
      nome,
      email,
      telefone,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>
            {convidado ? 'Editar Convidado' : 'Novo Convidado'}
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <ThemedText style={styles.buttonText}>Salvar</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    gap: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 