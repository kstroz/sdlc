import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BuildingGroup as BuildingGroupModel } from '@/src/domain/tasks/groupByBuilding';
import { BuildingGroup } from '@/src/components/BuildingGroup';
import { LoadTodayDeps, LoadTodayError, loadToday } from '@/src/use-cases/loadToday';

export interface TodayScreenProps {
  deps: LoadTodayDeps;
  formatDueAt: (dueAt: Date | null) => string;
}

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'error'; error: LoadTodayError }
  | { kind: 'ready'; groups: BuildingGroupModel[] };

export function TodayScreen({ deps, formatDueAt }: TodayScreenProps): React.ReactElement {
  const [state, setState] = useState<ScreenState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadToday(deps).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setState({ kind: 'ready', groups: result.value });
      } else {
        setState({ kind: 'error', error: result.error });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [deps]);

  if (state.kind === 'loading') {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (state.kind === 'error') {
    return (
      <View style={styles.center} testID="today-error">
        <Text>Could not load today’s tasks.</Text>
        <Text style={styles.muted}>{state.error.message}</Text>
      </View>
    );
  }

  if (state.groups.length === 0) {
    return (
      <View style={styles.center} testID="today-empty">
        <Text style={styles.emptyTitle}>No tasks for today</Text>
        <Text style={styles.muted}>Pull to refresh once your supervisor assigns work.</Text>
      </View>
    );
  }

  return (
    <FlatList
      testID="today-list"
      data={state.groups}
      keyExtractor={(g) => g.building.id}
      renderItem={({ item }) => <BuildingGroup group={item} formatDueAt={formatDueAt} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#666', marginTop: 4, textAlign: 'center' },
});
