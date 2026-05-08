export interface RandomId {
  generate(): string;
}

export const systemRandomId: RandomId = {
  generate(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  },
};
