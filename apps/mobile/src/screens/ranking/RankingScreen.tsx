import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export default function RankingScreen() {
  const session = useAuthStore((s) => s.session);
  const [ranking, setRanking] = useState<any[]>([]);
  const [minhaPosicao, setMinhaPosicao] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadRanking() {
    if (!session?.academiaId || !session?.userId) return;
    try {
      const r = await api.ranking.get(session.academiaId);
      setRanking(r);
      const me = r.find((item) => item.alunoId === session.userId);
      setMinhaPosicao(me ?? { posicao: null, pontos: 0 });
    } catch {}
  }

  useEffect(() => { loadRanking(); }, [session]);

  async function onRefresh() {
    setRefreshing(true);
    await loadRanking();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ranking</Text>

      {minhaPosicao && (
        <View style={styles.meuCard}>
          <Text style={styles.meuLabel}>Sua posição</Text>
          <Text style={styles.meuPosicao}>#{minhaPosicao.posicao ?? '-'}</Text>
          <Text style={styles.meuPontos}>{minhaPosicao.pontos} pontos</Text>
        </View>
      )}

      <FlatList
        data={ranking}
        keyExtractor={(item) => item.alunoId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
        renderItem={({ item }) => {
          const isMe = item.alunoId === session?.userId;
          return (
            <View style={[styles.row, isMe && styles.rowMe]}>
              <View style={styles.posicaoContainer}>
                <Text style={[styles.posicao, item.posicao <= 3 && styles.posicaoTop]}>{item.posicao}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.nome, isMe && styles.nomeMe]}>{item.aluno?.nome ?? 'Aluno'}</Text>
              </View>
              <Text style={styles.pontos}>{item.pontos} pts</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Ranking vazio. Faça check-in para aparecer aqui!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', padding: 16, paddingTop: 60 },
  meuCard: { backgroundColor: '#ecfdf5', marginHorizontal: 16, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  meuLabel: { color: '#6b7280', fontSize: 12 },
  meuPosicao: { fontSize: 32, fontWeight: 'bold', color: '#16a34a' },
  meuPontos: { color: '#4b5563', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  rowMe: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#16a34a' },
  posicaoContainer: { width: 32, alignItems: 'center' },
  posicao: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  posicaoTop: { color: '#16a34a' },
  info: { flex: 1, marginLeft: 12 },
  nome: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  nomeMe: { fontWeight: '700' },
  pontos: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 14 },
});
