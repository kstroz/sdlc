import { shouldUploadMedia } from './mediaPolicy';

describe('shouldUploadMedia', () => {
  it('non-media on wifi with wifiOnly=true uploads', () => {
    expect(
      shouldUploadMedia({
        actionType: 'complete_task',
        networkType: 'wifi',
        wifiOnlyForMedia: true,
      }),
    ).toBe(true);
  });

  it('non-media on cellular with wifiOnly=true uploads', () => {
    expect(
      shouldUploadMedia({
        actionType: 'complete_task',
        networkType: 'cellular',
        wifiOnlyForMedia: true,
      }),
    ).toBe(true);
  });

  it('non-media on cellular with wifiOnly=false uploads', () => {
    expect(
      shouldUploadMedia({
        actionType: 'block_task',
        networkType: 'cellular',
        wifiOnlyForMedia: false,
      }),
    ).toBe(true);
  });

  it('non-media offline does not upload', () => {
    expect(
      shouldUploadMedia({
        actionType: 'complete_task',
        networkType: 'none',
        wifiOnlyForMedia: false,
      }),
    ).toBe(false);
  });

  it('media on wifi with wifiOnly=true uploads', () => {
    expect(
      shouldUploadMedia({
        actionType: 'attach_photo',
        networkType: 'wifi',
        wifiOnlyForMedia: true,
      }),
    ).toBe(true);
  });

  it('media on cellular with wifiOnly=true skips', () => {
    expect(
      shouldUploadMedia({
        actionType: 'attach_photo',
        networkType: 'cellular',
        wifiOnlyForMedia: true,
      }),
    ).toBe(false);
  });

  it('media on cellular with wifiOnly=false uploads', () => {
    expect(
      shouldUploadMedia({
        actionType: 'attach_photo',
        networkType: 'cellular',
        wifiOnlyForMedia: false,
      }),
    ).toBe(true);
  });

  it('media offline does not upload', () => {
    expect(
      shouldUploadMedia({
        actionType: 'attach_photo',
        networkType: 'none',
        wifiOnlyForMedia: false,
      }),
    ).toBe(false);
  });
});
