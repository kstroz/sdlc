import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Task } from '@/src/types';

export interface TaskCardProps {
  task: Task;
  formatDueAt: (dueAt: Date | null) => string;
}

export function TaskCard({ task, formatDueAt }: TaskCardProps): React.ReactElement {
  return (
    <View style={styles.row} testID={`task-card-${task.id}`}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{task.title}</Text>
        <PriorityBadge priority={task.priority} />
      </View>
      <Text style={styles.due}>{formatDueAt(task.dueAt)}</Text>
    </View>
  );
}

function PriorityBadge({ priority }: { priority: Task['priority'] }): React.ReactElement {
  const isUrgent = priority === 'urgent';
  return (
    <View style={[styles.badge, isUrgent ? styles.badgeUrgent : styles.badgeNormal]}>
      <Text style={styles.badgeText}>{priority}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 8, paddingHorizontal: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '500', flexShrink: 1, paddingRight: 8 },
  due: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeUrgent: { backgroundColor: '#fee2e2' },
  badgeNormal: { backgroundColor: '#e5e7eb' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
