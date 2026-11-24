# Notifications

How to identify, classify and raise a notification. The terms are defined in [GLOSSARY.md](../../GLOSSARY.md).

Part 1 holds the rules and does not depend on this codebase. Part 2 maps them to the Workbench code.

- [Part 1: Rules](#part-1-rules)
  - [Notification or not](#notification-or-not)
  - [Code and topic](#code-and-topic)
  - [Severity](#severity)
  - [Parameters and details](#parameters-and-details)
  - [Duplicates](#duplicates)
  - [Retained or toast only](#retained-or-toast-only)
  - [Text](#text)
- [Part 2: In this repo](#part-2-in-this-repo)

## Part 1: Rules

### Notification or not

A notification reports an **event**: something that happened at a point in time. Before raising one, check that
nothing else should report it instead.

| Situation | Show it as |
|---|---|
| An ongoing condition: offline, backend unavailable, license expired | A **status**, not a notification |
| A request failed **because of** an active status | Nothing: the status already explains it |
| The main content of a view fails to load | An error state **inside the view** |
| A form field is invalid | A validation message **on the field** |
| A command succeeded and its result is visible on screen (a new row appears) | Nothing |

### Code and topic

Every kind of notification is identified by two separate fields: a **topic** and a **code**. Together they are a
stable identifier, independent of the text and the parameters.

- Both are in kebab-case. Example: topic `namespaces`, code `load-failed`.
- The topic is taken from a fixed list. It is the area the **cause** belongs to, not the view that raised the
  notification. A failure to load namespaces has topic `namespaces`, whether the RDF Rank view or the autocomplete
  raised it.
- The code names the kind of event and is unique within its topic. The same code may exist under different topics:
  `namespaces` / `load-failed` and `repositories` / `load-failed` are different kinds.
- The topic is part of the code definition. Whoever raises the notification does not choose or override it.
- The code holds no severity: `failed`, not `errors.failed`.
- Codes are defined once, in a registry. Code that raises a notification refers to a registry entry; it never
  builds a topic or a code from a string. Eight views reporting the same cause must raise the same topic and code.
- The message text is looked up by topic and code. The code is not the text and not a free-form translation key.

### Severity

The severity says what happened to what the user intended. Whoever raises the notification chooses it, so the same
code can carry different severities in different places.

| Severity | What happened | Example |
|---|---|---|
| `error` | It **did not** happen | The repository was not created; a SPARQL update failed |
| `warning` | It happened, but **incompletely or with a consequence** the user must know | A FedX repository was created without members; the class graph was reduced to fit; autocomplete works without namespace prefixes |
| `success` | It **fully** happened, and the result is not visible on screen | The export was downloaded; the repository was restarted |
| `info` | Nothing went wrong and it answers no action: a **fact** that changes the picture | The data in the repository changed |

When in doubt, ask: must the user **act**, or **reconsider** what they see?

- Act → `error`.
- Reconsider → `warning`.
- Neither → `success` or `info`.

### Parameters and details

A notification carries two kinds of values beside its code:

| | Parameters | Details |
|---|---|---|
| What | Values that identify **which problem** it is | Context that does **not** change which problem it is |
| Examples | The affected repository, the imported file | The view that raised it, the server's error text, a request id |
| Shown in | The message, in the toast and in the panel | The panel only, never the toast |
| Count for duplicates | Yes | No |

The server's error text is always a detail. It often carries timestamps or ids, which would make every
notification unique.

### Duplicates

Two notifications with the same topic, code, parameters and severity are **duplicates**. They collapse into one entry
with an occurrence count.

Notifications that differ only in severity are **not** duplicates and stay separate entries. A warning that follows an
error for the same problem appears next to the error; it neither merges into it nor changes its severity.

### Retained or toast only

Every notification is shown as a toast. Some are also **retained** in the notification panel for later review.

| Severity | Retained by default |
|---|---|
| `error`, `warning` | Yes |
| `success`, `info` | No |

A code may override the default. Override it on the **code definition**, not where the notification is raised:
whether a notification is worth keeping depends on its kind. Typical case: the success of a long operation that
may finish while the user is on another view (an import, a cluster change).

Retained notifications belong to the **user** who saw them. They survive a reload and a logout: when the same user
logs in again, the panel shows them again. Another user never sees them. With security off or in free access mode,
all sessions share one fixed identity.

A toast appears only in the browser tab that raised the notification. Other open tabs update the panel only.

### Text

- No title. The severity shows in the colour and the icon; the panel groups notifications under their topic name.
- No "Error!" or "Warning:" prefix in the message.
- One sentence where possible. Name what failed and the parameter that identifies it.
- When a code has no translation, show a generic fallback message; do not hide the notification.

## Part 2: In this repo

> **Status:** the registry and the topic enum arrive with the migration from `toastr` (GDB-14637). Until then,
> follow Part 1 for new code and add codes to the registry as described below.

### Where things live

All of it lives in `packages/api`, so the Angular workbench, the Stencil components and the legacy workbench share
one registry:

```text
packages/api/src/models/notification/
├── notification-topic.ts      # enum NotificationTopic, one value per topic
└── codes/
    ├── namespaces.codes.ts    # one file per topic
    └── import.codes.ts
```

### Defining a code

```ts
export const NamespacesCodes = {
  LOAD_FAILED: notificationCode(NotificationTopic.NAMESPACES, 'load-failed'),
  PREFIXES_UNAVAILABLE: notificationCode(NotificationTopic.NAMESPACES, 'prefixes-unavailable'),
};

export const ImportCodes = {
  // Retained although it is a success: an import may finish while the user is elsewhere.
  COMPLETED: notificationCode(NotificationTopic.IMPORT, 'completed', {retained: true}),
};
```

`notificationCode()` returns an object with separate `topic` and `code` fields. Never join them into one string
to identify a notification.

Each code needs a translation under `notifications.<topic>.<code>`, and each topic under
`notifications.topics.<topic>`. See [i18n](i18n.md).

### Storing retained notifications

Retained notifications are kept in the browser's `localStorage`, under a key per user. They do not follow the user to
another browser or machine. Logout does not clear them.

### Raising a notification

Pick the factory method by [severity](#severity), pass the code from the registry, then add the parameters.
Details get their own method with GDB-14637.

```ts
notify(
  Notification.warning(NamespacesCodes.PREFIXES_UNAVAILABLE)
    .withParameters({repositoryId})
);
```

- Angular: inject `NotificationProviderService`.
- Stencil and legacy: call `notify()` from `@ontotext/workbench-api`.
- Never call `toastr` or `OntoToastrService` directly.

## See also

- [Modern workbench (Angular): Notifications and errors](frontend-angular.md#notifications-and-errors)
- [Internationalization](i18n.md)
