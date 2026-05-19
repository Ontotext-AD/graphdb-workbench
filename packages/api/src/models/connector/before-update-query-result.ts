export class BeforeUpdateQueryResult {
  constructor(
    public status: string,
    public command: string,
    public messageLabelKey?: string,
    public parameters?: unknown,
    public message?: string,
    public iri?: string,
    public name?: string,
  ) {
  }
}

export const BeforeUpdateQueryResultStatus = {
  ERROR: 'error',
  SUCCESS: 'success'
};
