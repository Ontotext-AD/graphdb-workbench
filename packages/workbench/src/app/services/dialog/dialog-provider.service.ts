import {inject, Injectable, Type} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {firstValueFrom, map, Observable} from 'rxjs';
import {DialogOpenOptions} from '../../models/dialog-open-options';

/**
 * Service for opening application dialogs.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogProviderService {
  private readonly dialogService = inject(DialogService);

  /**
   * Opens a dialog for the given component and resolves with its close value.
   *
   * @template DataType Type of the payload passed to the dialog via `data`.
   * @template ReturnType Type expected when the dialog closes.
   * @param componentType Component rendered inside the dialog.
   * @param config Options controlling how the dialog is opened.
   * @returns Promise resolving to the value provided when the dialog closes.
   */
  public open<DataType, ReturnType>(componentType: Type<unknown>, config: DialogOpenOptions<DataType>): Promise<ReturnType | undefined> {
    return firstValueFrom(this.openDialogWithComponent(componentType, config));
  }

  /**
   * Opens a dialog for the given component and returns its close stream.
   */
  private openDialogWithComponent<DataType, ReturnType>(componentType: Type<unknown>, config: DialogOpenOptions<DataType>): Observable<ReturnType | undefined> {
    return this.createDialogRef<DataType>(componentType, config).onClose.pipe(map((value) => value as ReturnType | undefined));
  }

  public createDialogRef<DataType>(componentType: Type<unknown>, config: DialogOpenOptions<DataType>): DynamicDialogRef {
    const dialogConfig: DynamicDialogConfig<DataType> = {
      data: config.data,
      showHeader: !!config.header,
      header: config.header,
      width: config.width,
      height: config.height,
      closable: config.closable ?? false,
      modal: config.modal ?? true,
      styleClass: 'onto-dialog',
      draggable: false
    };
    const dialogRef = this.dialogService.open(componentType, dialogConfig);
    this.assertDialogIsDefined(dialogRef);
    return dialogRef;
  }

  private assertDialogIsDefined(dialogRef: DynamicDialogRef | null): asserts dialogRef is NonNullable<DynamicDialogRef> {
    if (dialogRef === undefined || dialogRef === null) {
      throw new Error('Dialog failed to open');
    }
  }
}
