import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BLOCK_REASONS,
  MAX_BLOCK_NOTE_LENGTH,
  type BlockReason,
} from '@/src/domain/tasks/blocking';
import type {
  BlockTaskInput,
  BlockTaskUseCaseError,
} from '@/src/use-cases/blockTask';
import type { Result } from '@/src/types';
import type { Task, OutboxAction } from '@/src/types';

const REASON_LABEL: Record<BlockReason, string> = {
  needs_parts: 'Needs parts',
  tenant_absent: 'Tenant absent',
  needs_specialist: 'Needs specialist',
};

export interface BlockSheetProps {
  taskId: string;
  onCancel: () => void;
  onBlocked: (task: Task) => void;
  blockTask: (
    input: BlockTaskInput,
  ) => Promise<Result<{ task: Task; outboxAction: OutboxAction }, BlockTaskUseCaseError>>;
}

export function BlockSheet(props: BlockSheetProps): React.ReactElement {
  const [reason, setReason] = useState<BlockReason | null>(null);
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async (): Promise<void> => {
    if (reason === null || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await props.blockTask({
      taskId: props.taskId,
      reason,
      note: note.length > 0 ? note : undefined,
    });
    setSubmitting(false);
    if (result.success) {
      props.onBlocked(result.value.task);
    } else {
      setError('Could not block task.');
    }
  };

  return (
    <View style={styles.sheet} accessibilityRole="alert">
      <Text style={styles.heading}>Cannot complete</Text>
      <View style={styles.reasons}>
        {BLOCK_REASONS.map((r) => (
          <Pressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ selected: reason === r }}
            accessibilityLabel={REASON_LABEL[r]}
            onPress={() => setReason(r)}
            style={[styles.reasonRow, reason === r ? styles.reasonRowSelected : null]}
          >
            <View style={[styles.radio, reason === r ? styles.radioSelected : null]} />
            <Text style={styles.reasonText}>{REASON_LABEL[r]}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Optional note"
        placeholder="Optional note"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={MAX_BLOCK_NOTE_LENGTH}
        style={styles.note}
      />
      {error !== null ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={props.onCancel}
          style={[styles.button, styles.cancelButton]}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Confirm"
          accessibilityState={{ disabled: reason === null || submitting }}
          disabled={reason === null || submitting}
          onPress={() => {
            void onConfirm();
          }}
          style={[
            styles.button,
            styles.confirmButton,
            reason === null || submitting ? styles.confirmDisabled : null,
          ]}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heading: { fontSize: 18, fontWeight: '600' },
  reasons: { gap: 8 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reasonRowSelected: { borderColor: '#1f6feb', backgroundColor: '#eef4ff' },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#888',
  },
  radioSelected: { borderColor: '#1f6feb', backgroundColor: '#1f6feb' },
  reasonText: { fontSize: 14 },
  note: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    textAlignVertical: 'top',
  },
  error: { color: '#c00', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  cancelButton: { backgroundColor: '#eee' },
  cancelText: { fontWeight: '600' },
  confirmButton: { backgroundColor: '#1f6feb' },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontWeight: '600' },
});
