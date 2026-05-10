import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';

export default function PerfilScreen() {
  const token = useAuthStore((s) => s.token);
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.alunos.perfil(token).then(setPerfil).catch(() => {});
  }, [token]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{usuario?.email?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.nome}>{perfil?.nome ?? usuario?.email}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{perfil?.totalCheckins ?? 0}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{perfil?.totalPontos ?? 0}</Text>
          <Text style={styles.statLabel}>Pontos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{perfil?.conquistas?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Conquistas</Text>
        </View>
      </View>

      {perfil?.conquistas && perfil.conquistas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          {perfil.conquistas.map((c: any) => (
            <View key={c.id} style={styles.badge}>
              <Text style={styles.badgeIcon}>{c.conquista?.icone ?? '🏅'}</Text>
              <View>
                <Text style={styles.badgeNome}>{c.conquista?.nome}</Text>
                <Text style={styles.badgeDesc}>{c.conquista?.descricao}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  nome: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  email: { color: '#6b7280', fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 20, marginBottom: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#16a34a' },
  statLabel: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, gap: 12 },
  badgeIcon: { fontSize: 24 },
  badgeNome: { fontWeight: '600', color: '#1f2937', fontSize: 14 },
  badgeDesc: { color: '#6b7280', fontSize: 12 },
  logoutButton: { marginHorizontal: 16, marginTop: 16, marginBottom: 40, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '600' },
});
