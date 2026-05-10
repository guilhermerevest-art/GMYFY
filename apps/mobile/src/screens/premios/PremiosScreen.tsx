import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export default function PremiosScreen() {
  const session = useAuthStore((s) => s.session);
  const [premios, setPremios] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!session?.academiaId) return;
    try {
      const res = await api.premios.vitrine(session.academiaId);
      setPremios(res);
    } catch {}
  }

  useEffect(() => { load(); }, [session]);

  async function resgatar(id: string, nome: string) {
    if (!session?.userId) return;
    try {
      await api.premios.resgatar(id, session.userId);
      Alert.alert('Resgate solicitado!', `Seu resgate de "${nome}" foi enviado para aprovação.`);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível resgatar');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Prêmios</Text>
      <FlatList
        data={premios}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#16a34a" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.nome}>{item.nome}</Text>
              {item.descricao && <Text style={styles.desc}>{item.descricao}</Text>}
              <Text style={styles.pontos}>{item.pontosNecessarios} pontos</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => resgatar(item.id, item.nome)}>
              <Text style={styles.buttonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum prêmio disponível</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', padding: 16, paddingTop: 60 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1 },
  nome: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  desc: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  pontos: { color: '#16a34a', fontWeight: '700', fontSize: 15, marginTop: 6 },
  button: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 14 },
});
