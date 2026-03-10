export class BeforeUpdateQueryResult {
  constructor(
    public status: string,
    public messageLabelKey: string,
    public parameters: unknown,
    public message: string) {
  }
}
