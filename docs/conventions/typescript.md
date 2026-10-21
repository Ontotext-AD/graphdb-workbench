# TypeScript conventions

- Prefer type inference when the type is obvious; annotate when it aids clarity
  or a public API boundary.
- Avoid `any`. Use `unknown` when a type is genuinely uncertain, then narrow.

> Strict type checking is enforced by `tsconfig.json` in `packages/api` and
> `packages/workbench` — you don't need to opt in per file. `packages/root-config`
> is not strict; write new code there as if it were.

Doc comments follow [JSDoc conventions](jsdoc.md).

## Errors

The question to ask before adding an error class is **"does a caller need to
catch this and branch?"**

- **Custom error class** — when the failure crosses a module boundary and the
  caller must react to it (retry, pick a message, fall back). Branching needs
  something more reliable than matching on `message`.
- **Generic `Error`** — when the throw means *this should never happen*: a
  violated precondition or invariant. Nobody catches it; it reaches the
  global `ErrorHandler` and becomes a bug report. The message is for the person
  reading the stack trace.

A custom error costs a file, its JSDoc and its tests — it should buy someone a
decision. Don't add one per throw site.

### Writing one

- Prefer **one class with a `kind` discriminant** over a class hierarchy: a
  union type gives callers exhaustive narrowing without a parallel inheritance
  tree. Branch on `kind`, not on `instanceof`.
- Always set `this.name` explicitly — otherwise subclasses stringify as plain
  `Error` once minified.
- Always forward the originating error as `cause`. For a class that normalizes
  foreign failures, preserving the original *is* the point.
- Name the file after the class (`file-import-error.ts`) and keep it
  beside the models of the module that throws it.

```typescript
export type FileImportErrorKind = 'parse' | 'validation' | 'upload';

export class FileImportError extends Error {
  constructor(
    readonly kind: FileImportErrorKind,
    message: string,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'FileImportError';
  }
}
```

Showing a failure to the user: [frontend-angular](frontend-angular.md#notifications-and-errors).
