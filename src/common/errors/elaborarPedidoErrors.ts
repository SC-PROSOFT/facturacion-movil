export class ValidationsBeforeSavingError extends Error {
  details: {
    type: string;
    text1: string;
  };

  constructor(message: string, details: {type: string; text1: string}) {
    super(message);
    this.name = 'ValidationsBeforeSavingError';
    this.details = details;
  }
}
