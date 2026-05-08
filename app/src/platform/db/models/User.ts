import type { UserRow } from '../schema';

export class User {
  constructor(private readonly row: UserRow) {}

  get id(): string {
    return this.row.id;
  }
  get username(): string {
    return this.row.username;
  }
  get displayName(): string {
    return this.row.displayName;
  }
  get sessionToken(): string | null {
    return this.row.sessionToken;
  }
  get sessionExpiresAt(): Date | null {
    return this.row.sessionExpiresAt;
  }

  toRow(): UserRow {
    return this.row;
  }
}
