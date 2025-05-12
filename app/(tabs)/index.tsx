import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isNumeric, setIsNumeric] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [guestData, setGuestData] = useState<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function handleBarCodeScanned(result: BarcodeScanningResult) {
    const data = result.data.trim();
    setScannedData(data);
    setIsNumeric(/^\d+$/.test(data));

    if (isNumeric) {
      try {
        const response = await fetch('http://192.168.1.73:5001/convidados');
        const guests = await response.json();
        const guest = guests.find((g: any) => g.telefone === data);

        if (guest) {
          setGuestData(guest);
        } else {
          setGuestData(null);
        }
        setModalVisible(true); // Show modal with data
      } catch (error) {
        console.error('Error fetching guest data:', error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Scanear QR Code</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {scannedData && (
        <View
          style={[
            styles.resultContainer,
            { backgroundColor: isNumeric ? 'green' : 'red' },
          ]}
        >
          <Text style={styles.resultText}>{scannedData}</Text>
        </View>
      )}

      {/* Modal to show guest details */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {guestData ? (
              <>
                <Text style={styles.modalText}>Nome: {guestData.nome}</Text>
                <Text style={styles.modalText}>Email: {guestData.email}</Text>
                <Text style={styles.modalText}>Telefone: {guestData.telefone}</Text>
                <Text style={styles.modalText}>Entrou na cerimônia: {guestData.entrou_cerimonia ? 'Sim' : 'Não'}</Text>
              </>
            ) : (
              <Text style={styles.modalText}>Convidado não encontrado</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 64,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  resultContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
