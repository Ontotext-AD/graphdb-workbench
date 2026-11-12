# GraphDB Workbench

The web UI for administering and querying GraphDB.

## Language

### Notifications

**Notification**:
A message the Workbench raises to tell the user about an outcome or a condition that needs their attention.
_Avoid_: Alert, message

**Status**:
An ongoing condition, such as being offline or the backend being unavailable, that lasts until something changes. A status is not a notification; while it explains a failure, that failure raises no notification of its own.
_Avoid_: Critical notification, sticky notification

**Notification code**:
A stable identifier for a kind of notification, independent of its display text and parameters. Two notifications with the same code are the same kind, whatever their parameters.
_Avoid_: Message key, translation key

**Notification topic**:
The area a notification's cause belongs to, such as namespaces or repositories. It is the leading part of the notification code and is named after the cause, not after the view that raised it.
_Avoid_: Source, category, feature

**Notification severity**:
What happened to what the user intended: error (it did not happen), warning (it happened, but incompletely or with a consequence the user must know), success (it fully happened), or info (a fact that changes the picture, not tied to an intent). It is chosen by whoever raises the notification, so the same code may carry different severities.
_Avoid_: Type, level

**Notification parameters**:
Values that, together with the code, identify the specific problem, such as the affected repository. Different parameters mean a different problem.

**Notification details**:
Context attached to a notification that does not change which problem it is, such as the view that raised it or the server's error text. Details appear in the notification panel, not in the toast.
_Avoid_: Context, metadata

**Duplicate notification**:
A notification with the same code and the same parameters as one already raised. Duplicates collapse into one, which takes the highest severity among them.

**Toast**:
A brief, self-dismissing display of a notification.
_Avoid_: Popup, snackbar

**Notification panel**:
The place where retained notifications stay for the user to review later.
_Avoid_: Notification center, inbox

**Retained notification**:
A notification that is kept in the notification panel after its toast is gone. By default errors and warnings are retained and successes and infos are not; a notification code may override this. Retained notifications belong to the identity that saw them and survive reloads, but not a logout or a change of identity.
_Avoid_: Persistent notification, sticky notification
