import { validateUsername, validatePassword } from './credentials';

describe('validateUsername', () => {
  it('accepts a normal username', () => {
    const result = validateUsername('marek');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('marek');
    }
  });

  it('trims surrounding whitespace before validating', () => {
    const result = validateUsername('  tomasz  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('tomasz');
    }
  });

  it('rejects an empty string', () => {
    const result = validateUsername('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('username_empty');
    }
  });

  it('rejects whitespace-only input', () => {
    const result = validateUsername('   ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('username_empty');
    }
  });

  it('rejects usernames longer than 64 characters', () => {
    const result = validateUsername('a'.repeat(65));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('username_too_long');
    }
  });

  it('accepts usernames exactly 64 characters long', () => {
    const result = validateUsername('a'.repeat(64));
    expect(result.success).toBe(true);
  });
});

describe('validatePassword', () => {
  it('accepts a password of at least 8 characters', () => {
    const result = validatePassword('hunter22');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('hunter22');
    }
  });

  it('rejects an empty password', () => {
    const result = validatePassword('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('password_too_short');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('password_too_short');
    }
  });

  it('accepts a password exactly 8 characters long', () => {
    const result = validatePassword('12345678');
    expect(result.success).toBe(true);
  });
});
