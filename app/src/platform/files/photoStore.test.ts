import type { FileSystemAdapter } from './photoStore';
import { createPhotoStore } from './photoStore';

interface FakeCall {
  op: string;
  args: unknown;
}

function makeFakeFs(documentDirectory: string | null, dirExists = false): {
  fs: FileSystemAdapter;
  calls: FakeCall[];
} {
  const calls: FakeCall[] = [];
  let exists = dirExists;
  const fs: FileSystemAdapter = {
    documentDirectory,
    async getInfoAsync(uri) {
      calls.push({ op: 'getInfo', args: uri });
      return { exists };
    },
    async makeDirectoryAsync(uri, options) {
      calls.push({ op: 'mkdir', args: { uri, options } });
      exists = true;
    },
    async copyAsync(options) {
      calls.push({ op: 'copy', args: options });
    },
    async deleteAsync(uri, options) {
      calls.push({ op: 'delete', args: { uri, options } });
    },
  };
  return { fs, calls };
}

describe('photoStore', () => {
  it('copies the source uri to documentDirectory/photos/<id>.jpg', async () => {
    const { fs, calls } = makeFakeFs('file:///doc/');
    const store = createPhotoStore({ fs });

    const result = await store.save('file:///camera/IMG_1.heic', 'p123');

    expect(result.localPath).toBe('file:///doc/photos/p123.jpg');
    expect(calls).toContainEqual({
      op: 'copy',
      args: { from: 'file:///camera/IMG_1.heic', to: 'file:///doc/photos/p123.jpg' },
    });
  });

  it('creates the photos directory when it does not exist', async () => {
    const { fs, calls } = makeFakeFs('file:///doc/', false);
    const store = createPhotoStore({ fs });

    await store.save('file:///camera/x.jpg', 'p1');

    const mkdir = calls.find((c) => c.op === 'mkdir');
    expect(mkdir).toBeDefined();
    expect(mkdir!.args).toEqual({
      uri: 'file:///doc/photos/',
      options: { intermediates: true },
    });
  });

  it('does not call makeDirectoryAsync when the directory already exists', async () => {
    const { fs, calls } = makeFakeFs('file:///doc/', true);
    const store = createPhotoStore({ fs });

    await store.save('file:///camera/x.jpg', 'p1');

    expect(calls.some((c) => c.op === 'mkdir')).toBe(false);
  });

  it('throws when documentDirectory is null', async () => {
    const { fs } = makeFakeFs(null);
    const store = createPhotoStore({ fs });

    await expect(store.save('file:///x.jpg', 'p1')).rejects.toThrow(
      /documentDirectory/,
    );
  });

  it('delete forwards to deleteAsync with idempotent flag', async () => {
    const { fs, calls } = makeFakeFs('file:///doc/', true);
    const store = createPhotoStore({ fs });

    await store.delete('file:///doc/photos/p1.jpg');

    expect(calls).toContainEqual({
      op: 'delete',
      args: { uri: 'file:///doc/photos/p1.jpg', options: { idempotent: true } },
    });
  });

  it('honours a custom subdir', async () => {
    const { fs } = makeFakeFs('file:///doc/');
    const store = createPhotoStore({ fs, subdir: 'media' });

    const result = await store.save('file:///camera/x.jpg', 'p1');

    expect(result.localPath).toBe('file:///doc/media/p1.jpg');
  });
});
