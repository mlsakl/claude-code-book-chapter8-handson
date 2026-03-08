export class TaskCLIError extends Error {
  constructor(
    message: string,
    public readonly code: number = 1,
  ) {
    super(message);
    this.name = 'TaskCLIError';
  }
}

export class ValidationError extends TaskCLIError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
