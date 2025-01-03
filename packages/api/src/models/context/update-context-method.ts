/**
 * Utility type to convert SNAKE_CASE to PascalCase.
 */
type SnakeToPascalCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Lowercase<Head>>}${SnakeToPascalCase<Tail>}`
    : Capitalize<Lowercase<S>>;

/**
 * A contract that defines the fields and methods of a context service.
 */
export type DeriveContextServiceContract<TFields extends Record<string, unknown>, TParams extends Partial<Record<keyof TFields, unknown>> = TFields> =
  TFields & UpdateContextMethods<TFields, TParams>;

/**
 * Generates update methods based on fields.
 * Each field will have an update method with the name update{FieldName} and a single parameter of the field type.
 */
export type UpdateContextMethods<T, TParams extends Partial<Record<keyof T, unknown>> = T> = {
  [K in keyof T as K extends string
    ? `update${SnakeToPascalCase<K>}`
    : never]: (value: TParams[K]) => void;
};
