import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export default function HomeScreen() {
  const session = useAuthStore((s) => s.session);
  const [feed, setFeed] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadFeed() {
    if (!session?.academiaId) return;
    try {
      const items = await api.feed.get(session.academiaId);
      setFeed(items);
    } catch {}
  }

  useEffect(() => { loadFeed(); }, [session]);

  async function onRefresh() {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed</Text>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.nome}>{(item.autor as any)?.nome ?? 'Aluno'}</Text>
              <Text style={styles.data}>{new Date(item.criadoEm).toLocaleDateString('pt-BR')}</Text>
            </View>
            {item.conteudo && <Text style={styles.conteudo}>{item.conteudo}</Text>}
            <View style={styles.reacoes}>
              <Text style={styles.reacaoCount}>{item._count?.reacoes ?? 0} reações</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma atividade ainda. Faça seu primeiro check-in!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', padding: 16, paddingTop: 60 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nome: { fontWeight: '600', color: '#1f2937', fontSize: 15 },
  data: { color: '#9ca3af', fontSize: 12 },
  conteudo: { color: '#4b5563', fontSize: 14, marginBottom: 8 },
  reacoes: { flexDirection: 'row' },
  reacaoCount: { color: '#6b7280', fontSize: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 14, paddingHorizontal: 32 },
});
