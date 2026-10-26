import {Model} from '../common';

/**
 * A validation error the backend returned for a rejected graph-navigator settings file.
 */
export class GraphNavigatorSettingsError extends Model<GraphNavigatorSettingsError> {
  /** The kind of the problem, e.g. `required` or `wrong_type`. */
  readonly code: string;
  /** The predicate with a prefix, e.g. `gn:acceptBlankNodes`, or `undefined` when the error is not about a property. */
  readonly property?: string;
  /** The untranslated description of the problem. */
  readonly message: string;
  /** The details of the problem, e.g. the `expected` and `actual` types of a `wrong_type` error. */
  readonly params: Record<string, string>;
  /** The IRI of the predicate in the file, or `undefined` when the error is not about a predicate. */
  readonly predicate?: string;

  constructor(data: {
    code: string;
    property?: string;
    message: string;
    params: Record<string, string>;
    predicate?: string;
  }) {
    super();
    this.code = data.code;
    this.property = data.property;
    this.message = data.message;
    this.params = data.params;
    this.predicate = data.predicate;
  }
}
