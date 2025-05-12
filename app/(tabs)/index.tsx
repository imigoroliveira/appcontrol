import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isNumeric, setIsNumeric] = useState<boolean | null>(null);

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

  function handleBarCodeScanned(result: BarcodeScanningResult) {
    const data = result.data.trim();
    setScannedData(data);
    setIsNumeric(/^\d+$/.test(data)); // true se for número
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
            <Text style={styles.text}>Trocar câmera</Text>
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
});
