import type { TaskRow } from '../schema';

export class Task {
  constructor(private readonly row: TaskRow) {}

  get id(): string {
    return this.row.id;
  }
  get buildingId(): string {
    return this.row.buildingId;
  }
  get assignedToUserId(): string {
    return this.row.assignedToUserId;
  }
  get title(): string {
    return this.row.title;
  }
  get status(): TaskRow['status'] {
    return this.row.status;
  }
  get priority(): TaskRow['priority'] {
    return this.row.priority;
  }
  get dueAt(): Date | null {
    return this.row.dueAt;
  }
  get completedAt(): Date | null {
    return this.row.completedAt;
  }

  toRow(): TaskRow {
    return this.row;
  }
}
