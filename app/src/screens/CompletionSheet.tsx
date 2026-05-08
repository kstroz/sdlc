import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Result, Task } from '@/src/types';
import type {
  CompleteTaskError,
  CompleteTaskInput,
  PhotoDraft,
} from '@/src/use-cases/completeTask';

export interface PhotoPickerResult {
  uri: string;
  sizeBytes: number;
  capturedAt: Date;
}

export interface PhotoPicker {
  takePhoto(): Promise<PhotoPickerResult | null>;
  pickFromLibrary(): Promise<PhotoPickerResult | null>;
}

export interface CompletionSheetProps {
  taskId: string;
  userId: string;
  photoPicker: PhotoPicker;
  onCancel: () => void;
  onCompleted: (task: Task) => void;
  completeTask: (
    input: CompleteTaskInput,
  ) => Promise<Result<{ task: Task; photoIds: string[] }, CompleteTaskError>>;
}

export function CompletionSheet(props: CompletionSheetProps): React.ReactElement {
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onTake = async (): Promise<void> => {
    const r = await props.photoPicker.takePhoto();
    if (r !== null) setPhotos((p) => [...p, toDraft(r)]);
  };

  const onPick = async (): Promise<void> => {
    const r = await props.photoPicker.pickFromLibrary();
    if (r !== null) setPhotos((p) => [...p, toDraft(r)]);
  };

  const onConfirm = async (): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await props.completeTask({
      taskId: props.taskId,
      completedByUserId: props.userId,
      photos,
    });
    setSubmitting(false);
    if (result.success) props.onCompleted(result.value.task);
    else setError('Could not mark task done.');
  };

  return (
    <View style={styles.sheet} accessibilityRole="alert">
      <Text style={styles.heading}>Mark done</Text>
      <View style={styles.thumbs}>
        {photos.map((p, i) => (
          <Image key={`${p.sourceUri}-${i}`} source={{ uri: p.sourceUri }} style={styles.thumb} />
        ))}
      </View>
      <View style={styles.photoActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          onPress={() => void onTake()}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryText}>Take photo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pick from library"
          onPress={() => void onPick()}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryText}>Pick photo</Text>
        </Pressable>
      </View>
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
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={() => void onConfirm()}
          style={[styles.button, styles.confirmButton, submitting ? styles.confirmDisabled : null]}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

function toDraft(r: PhotoPickerResult): PhotoDraft {
  return { sourceUri: r.uri, sizeBytes: r.sizeBytes, capturedAt: r.capturedAt };
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
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#eee' },
  photoActions: { flexDirection: 'row', gap: 8 },
  error: { color: '#c00', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  secondaryButton: { backgroundColor: '#eef4ff', borderWidth: 1, borderColor: '#1f6feb' },
  secondaryText: { color: '#1f6feb', fontWeight: '600' },
  cancelButton: { backgroundColor: '#eee' },
  cancelText: { fontWeight: '600' },
  confirmButton: { backgroundColor: '#1f6feb' },
  confirmDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontWeight: '600' },
});
