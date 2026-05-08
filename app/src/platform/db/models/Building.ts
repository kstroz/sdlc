import type { BuildingRow } from '../schema';

export class Building {
  constructor(private readonly row: BuildingRow) {}

  get id(): string {
    return this.row.id;
  }
  get name(): string {
    return this.row.name;
  }
  get streetAddress(): string {
    return this.row.streetAddress;
  }
  get city(): string {
    return this.row.city;
  }
  get latitude(): number | null {
    return this.row.latitude;
  }
  get longitude(): number | null {
    return this.row.longitude;
  }

  toRow(): BuildingRow {
    return this.row;
  }
}
