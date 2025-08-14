import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isNumeric, setIsNumeric] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [found, setFound] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalShown, setModalShown] = useState(false);

  // Prevent multiple modal displays
  useEffect(() => {
    if (modalShown && !modalVisible) {
      // If modal was supposed to be shown but isn't visible, reset the flag
      setModalShown(false);
    }
  }, [modalVisible, modalShown]);

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
    // Double check if scanning is enabled and not already processing
    if (!isScanning || isProcessing || modalShown) {
      console.log('Scanning blocked:', { isScanning, isProcessing, modalShown });
      return;
    }
    
    const data = result.data.trim();
    
    // Prevent scanning the same barcode multiple times
    if (lastScannedData === data) {
      console.log('Duplicate scan blocked:', data);
      return;
    }
    
    console.log('Processing scan:', data);
    
    // Set all states immediately to prevent race conditions
    setIsProcessing(true);
    setModalShown(true);
    setIsScanning(false); // Stop scanning immediately
    
    const isDataNumeric = /^\d+$/.test(data);
    setIsNumeric(isDataNumeric);

    if (isDataNumeric) {
      try {
        const response = await fetch('https://appcontrol-backend.onrender.com/guests');

        if (response.status === 200) {
          const guests = await response.json();
          const guest = guests.find((g: any) => g.telefone === data);

          if (guest) {
            setGuestName(guest.nome);
            setFound(true);
          } else {
            setGuestName(null);
            setFound(false);
          }
        } else {
          // If status is not 200, treat as guest not found
          setGuestName(null);
          setFound(false);
        }

        // Add a small delay to ensure state is stable before showing modal
        setTimeout(() => {
          if (!modalVisible) { // Only show if not already visible
            setModalVisible(true);
          }
        }, 100);
        
      } catch (error) {
        console.error('Error fetching guest data:', error);
        setGuestName(null);
        setFound(false);
        
        // Add a small delay to ensure state is stable before showing modal
        setTimeout(() => {
          if (!modalVisible) { // Only show if not already visible
            setModalVisible(true);
          }
        }, 100);
      }
    } else {
      // If not numeric, still show modal with error
      setGuestName(null);
      setFound(false);
      
      setTimeout(() => {
        if (!modalVisible) { // Only show if not already visible
          setModalVisible(true);
        }
      }, 100);
    }
    
    // Reset processing state after a longer delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  }

  return (
    <View style={styles.container}>
      {isScanning && (
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
      )}
       
       {!isScanning && (
         <View style={styles.cameraPausedContainer}>
           <Text style={styles.cameraPausedText}>Câmera pausada</Text>
           <Text style={styles.cameraPausedSubtext}>Feche a modal para continuar escaneando</Text>
         </View>
       )}

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

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsScanning(true);
          setLastScannedData(null);
          setModalShown(false);
          setScannedData(null);
          setFound(false);
          setGuestName(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {found ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.modalText, { color: 'green', fontWeight: 'bold', fontSize: 20 }]}>
                  {guestName}
                </Text>
                <Text style={{ fontSize: 22, color: 'green', marginLeft: 8 }}>✔</Text>
              </View>
            ) : (
              <Text style={[styles.modalText, { color: 'red', fontWeight: 'bold' }]}>
                Convidado não encontrado
              </Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setIsScanning(true); // Re-enable scanning when modal closes
                setLastScannedData(null); // Reset last scanned data to allow re-scanning
                setModalShown(false); // Reset modal shown flag
                setScannedData(null); // Clear scanned data
                setFound(false); // Reset found state
                setGuestName(null); // Reset guest name
              }}
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
  container: { flex: 1 },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
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
  text: { fontSize: 18, color: 'white' },
  resultContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  resultText: { fontSize: 20, color: 'white', fontWeight: 'bold' },
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
  modalText: { fontSize: 18, marginVertical: 5 },
  closeButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  closeButtonText: { color: 'white', fontSize: 16 },
  scanningDisabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scanningDisabledText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cameraPausedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraPausedText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cameraPausedSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
});
