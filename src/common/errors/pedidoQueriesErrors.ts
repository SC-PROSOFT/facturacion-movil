export class ApiSaveOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiSaveOrderError';
  }
}
