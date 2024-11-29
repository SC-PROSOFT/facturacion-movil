export class ApiSaveInvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiSaveInvoiceError';
  }
}
