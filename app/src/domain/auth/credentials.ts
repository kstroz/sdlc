import type { Result } from '../../types';
import { ok, err } from '../../types';

export type ValidationError =
  | 'username_empty'
  | 'username_too_long'
  | 'password_too_short';

const USERNAME_MAX_LENGTH = 64;
const PASSWORD_MIN_LENGTH = 8;

export function validateUsername(s: string): Result<string, ValidationError> {
  const trimmed = s.trim();
  if (trimmed.length === 0) {
    return err('username_empty');
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return err('username_too_long');
  }
  return ok(trimmed);
}

export function validatePassword(s: string): Result<string, ValidationError> {
  if (s.length < PASSWORD_MIN_LENGTH) {
    return err('password_too_short');
  }
  return ok(s);
}
