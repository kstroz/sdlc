import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Building, Task, TaskStatus } from '@/src/types';
import type { MapsOpener } from '@/src/platform/maps/openInMapsApp';

export interface TaskDetailScreenProps {
  task: Task;
  building: Building;
  mapsOpener: MapsOpener;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending',
  done: 'Done',
  blocked: 'Blocked',
};

export function TaskDetailScreen(props: TaskDetailScreenProps): React.ReactElement {
  const { task, building, mapsOpener } = props;

  const onShowOnMap = (): void => {
    void mapsOpener.open(building.streetAddress);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{STATUS_LABEL[task.status]}</Text>
      </View>
      {task.description !== null ? (
        <Text style={styles.description}>{task.description}</Text>
      ) : null}
      {task.managerNotes !== null ? (
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Manager notes</Text>
          <Text style={styles.notesText}>{task.managerNotes}</Text>
        </View>
      ) : null}
      <Text style={styles.address}>{building.streetAddress}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show on map"
        onPress={onShowOnMap}
        style={styles.mapButton}
      >
        <Text style={styles.mapButtonText}>Show on map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  statusText: { fontSize: 12, fontWeight: '500' },
  description: { fontSize: 14 },
  notesBlock: { gap: 4 },
  notesLabel: { fontSize: 12, fontWeight: '600' },
  notesText: { fontSize: 14 },
  address: { fontSize: 14, fontStyle: 'italic' },
  mapButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1f6feb',
  },
  mapButtonText: { color: '#fff', fontWeight: '600' },
});
