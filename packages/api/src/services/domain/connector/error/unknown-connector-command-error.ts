export class UnknownConnectorCommandError extends Error {
  constructor(command: string) {
    super(`Unknown connector command: ${command}`);
  }
}
