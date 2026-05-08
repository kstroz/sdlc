import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BuildingGroup as BuildingGroupModel } from '@/src/domain/tasks/groupByBuilding';
import { TaskCard } from './TaskCard';

export interface BuildingGroupProps {
  group: BuildingGroupModel;
  formatDueAt: (dueAt: Date | null) => string;
}

export function BuildingGroup({ group, formatDueAt }: BuildingGroupProps): React.ReactElement {
  return (
    <View style={styles.section} testID={`building-group-${group.building.id}`}>
      <View style={styles.header}>
        <Text style={styles.name}>{group.building.name}</Text>
        <Text style={styles.address}>{group.building.streetAddress}</Text>
      </View>
      {group.tasks.map((task) => (
        <TaskCard key={task.id} task={task} formatDueAt={formatDueAt} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  header: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6' },
  name: { fontSize: 18, fontWeight: '700' },
  address: { fontSize: 12, color: '#555' },
});
