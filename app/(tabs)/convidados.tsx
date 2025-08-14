import ConvidadoModal from '@/app/ConvidadoModal';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

interface Convidado {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export default function ConvidadosScreen() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConvidado, setSelectedConvidado] = useState<Convidado | undefined>();

  const fetchConvidados = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://appcontrol-backend.onrender.com/guests');
      if (!response.ok) {
        throw new Error('Erro ao carregar convidados');
      }
      const data = await response.json();
      setConvidados(data);
      setError(null);
    } catch (err) {
      setError('Não foi possível carregar os convidados');
      Alert.alert('Erro', 'Não foi possível carregar os convidados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConvidados();
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://appcontrol-backend.onrender.com/guests${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar convidado');
      }
      Alert.alert('Sucesso', 'Convidado removido com sucesso');
      fetchConvidados();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível remover o convidado');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (convidado: Omit<Convidado, 'id'> & { id?: number }) => {
    try {
      setLoading(true);
      const url = convidado.id
        ? `https://appcontrol-backend.onrender.com/guests${convidado.id}`
        : 'https://appcontrol-backend.onrender.com/guests';
      
      const method = convidado.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(convidado),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar convidado');
      }

      Alert.alert('Sucesso', 'Convidado salvo com sucesso');
      fetchConvidados();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar o convidado');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (convidado: Convidado) => {
    setSelectedConvidado(convidado);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedConvidado(undefined);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchConvidados();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.2.fill"
          style={styles.headerImage}
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Convidados</ThemedText>
      </ThemedView>

      {loading && !refreshing && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      )}

      {error && !loading && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchConvidados}>
            <ThemedText style={styles.retryButtonText}>Tentar novamente</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {!loading && !error && (
        <>
          <ThemedView style={styles.listContainer}>
            {convidados.map((convidado) => (
              <ThemedView key={convidado.id} style={styles.convidadoCard}>
                <ThemedView style={styles.convidadoInfo}>
                  <ThemedText style={styles.convidadoNome}>{convidado.nome}</ThemedText>
                  <ThemedText style={styles.convidadoEmail}>{convidado.email}</ThemedText>
                  <ThemedText style={styles.convidadoTelefone}>{convidado.telefone}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.convidadoActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(convidado)}>
                    <IconSymbol name="pencil" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Confirmar exclusão',
                        `Deseja realmente excluir ${convidado.nome}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Excluir', onPress: () => handleDelete(convidado.id) }
                        ]
                      );
                    }}>
                    <IconSymbol name="trash" size={20} color="#fff" />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>

          <TouchableOpacity 
            style={[styles.addButton, loading && styles.disabledButton]} 
            onPress={handleAdd}
            disabled={loading}>
            <IconSymbol name="plus" size={24} color="#fff" />
            <ThemedText style={styles.addButtonText}>Adicionar Convidado</ThemedText>
          </TouchableOpacity>
        </>
      )}

      <ConvidadoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        convidado={selectedConvidado}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
  },
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  listContainer: {
    gap: 10,
    padding: 10,
  },
  convidadoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  convidadoInfo: {
    flex: 1,
  },
  convidadoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  convidadoEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  convidadoTelefone: {
    fontSize: 14,
    color: '#666',
  },
  convidadoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    gap: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
