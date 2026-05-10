import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';

export default function CheckinScreen() {
  const token = useAuthStore((s) => s.token);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [resultado, setResultado] = useState<{ pontosGanhos: number; descricoes: string[] } | null>(null);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || !token) return;
    setScanned(true);
    try {
      const res = await api.checkins.validar(data, token);
      setResultado(res);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Erro ao fazer check-in');
      setScanned(false);
    }
  }

  if (!permission) return <View style={styles.container}><Text>Carregando...</Text></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Precisamos de acesso à câmera para fazer check-in</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (resultado) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Check-in realizado!</Text>
          <Text style={styles.pontos}>+{resultado.pontosGanhos} pontos</Text>
          {resultado.descricoes.map((d, i) => (
            <Text key={i} style={styles.descricao}>{d}</Text>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => { setScanned(false); setResultado(null); }}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>Aponte para o QR Code da academia</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: '#16a34a', borderRadius: 16 },
  scanText: { color: '#fff', marginTop: 24, fontSize: 16 },
  text: { color: '#4b5563', fontSize: 16, textAlign: 'center', marginBottom: 16, paddingHorizontal: 32 },
  button: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 32, marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', marginHorizontal: 24 },
  successIcon: { fontSize: 48, color: '#16a34a', marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  pontos: { fontSize: 32, fontWeight: 'bold', color: '#16a34a', marginBottom: 12 },
  descricao: { color: '#6b7280', fontSize: 14, marginBottom: 4 },
});
