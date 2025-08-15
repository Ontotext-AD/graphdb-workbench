export abstract class ErrorBase extends Error {
  public constructor(private text?: string) {
    super();
  }

  public get message(): string {
    return `${this.constructor.name}: ${this.text}`;
  }
}
