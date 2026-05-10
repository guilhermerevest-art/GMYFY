import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export default function DesafiosScreen() {
  const session = useAuthStore((s) => s.session);
  const [desafios, setDesafios] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!session?.academiaId) return;
    try {
      const res = await api.desafios.ativos(session.academiaId);
      setDesafios(res);
    } catch {}
  }

  useEffect(() => { load(); }, [session]);

  async function participar(id: string) {
    if (!session?.userId) return;
    await api.desafios.participar(id, session.userId);
    load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Desafios</Text>
      <FlatList
        data={desafios}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#16a34a" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.desc}>{item.descricao}</Text>
            <Text style={styles.meta}>Meta: {item.metaCheckins} check-ins · {item._count?.participantes ?? 0} participantes</Text>
            <TouchableOpacity style={styles.button} onPress={() => participar(item.id)}>
              <Text style={styles.buttonText}>Participar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum desafio ativo no momento</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', padding: 16, paddingTop: 60 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16 },
  nome: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  desc: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  meta: { color: '#9ca3af', fontSize: 12, marginBottom: 12 },
  button: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 14 },
});
