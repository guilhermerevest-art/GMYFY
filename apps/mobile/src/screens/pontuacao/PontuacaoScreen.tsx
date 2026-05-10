import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

interface PontuacaoResumo {
  totalPontos: number;
  streakAtual: number;
  maiorStreak: number;
}

interface PontoItem {
  id: string;
  quantidade: number;
  descricao: string;
  criado_em: string;
}

export default function PontuacaoScreen() {
  const session = useAuthStore((s) => s.session);
  const [resumo, setResumo] = useState<PontuacaoResumo>({ totalPontos: 0, streakAtual: 0, maiorStreak: 0 });
  const [historico, setHistorico] = useState<PontoItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!session?.userId || !session?.academiaId) return;
    try {
      const [r, h] = await Promise.all([
        api.pontuacao.resumo(session.userId, session.academiaId),
        api.pontuacao.historico(session.userId),
      ]);
      setResumo(r);
      setHistorico(h);
    } catch {}
  }

  useEffect(() => { load(); }, [session]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pontuacao</Text>

      <View style={styles.resumoContainer}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoValor}>{resumo.totalPontos}</Text>
          <Text style={styles.resumoLabel}>Total de Pontos</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoValor}>{resumo.streakAtual}</Text>
          <Text style={styles.resumoLabel}>Streak Atual</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoValor}>{resumo.maiorStreak}</Text>
          <Text style={styles.resumoLabel}>Maior Streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historico</Text>

      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowDesc}>{item.descricao || 'Pontos'}</Text>
              <Text style={styles.rowData}>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</Text>
            </View>
            <Text style={styles.rowPontos}>+{item.quantidade}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum ponto registrado ainda</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', padding: 16, paddingTop: 60 },
  resumoContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 24 },
  resumoCard: { flex: 1, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 16, alignItems: 'center' },
  resumoValor: { fontSize: 24, fontWeight: 'bold', color: '#16a34a' },
  resumoLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', paddingHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  rowInfo: { flex: 1 },
  rowDesc: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  rowData: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rowPontos: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },
});
