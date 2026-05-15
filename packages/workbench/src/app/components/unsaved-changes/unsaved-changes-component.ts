import {UnsavedChangesService} from '../../services/unsaved-changes/unsaved-changes.service';
import {DestroyRef, inject} from '@angular/core';
import {UnsavedChanges} from '../../models/unsaved-changes/unsaved-changes';

/**
 * Abstract base class for Angular components that need to block navigation when they hold
 * unsaved changes. Extending this class automatically registers the component with
 * {@link UnsavedChangesService} on construction and unregisters it on destroy, so subclasses
 * only need to implement {@link hasUnsavedChanges}.
 */
export abstract class UnsavedChangesComponent implements UnsavedChanges {
  private readonly unsavedChangesService = inject(UnsavedChangesService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.unsavedChangesService.registerComponent(this);
    this.destroyRef.onDestroy(() => this.unsavedChangesService.unregisterComponent(this));
  }

  abstract hasUnsavedChanges(): boolean
}
