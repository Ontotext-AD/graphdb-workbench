import {Type} from '@angular/core';

/**
 * Options used by `DialogProviderService` when opening a dialog.
 *
 * @template DataType - Type of the payload passed to the dialog component via `data`.
 */
export interface DialogOpenOptions<DataType> {
  data?: DataType;
  showHeader?: boolean;
  header?: string;
  width?: string;
  height?: string;
  closable?: boolean;
  modal?: boolean;
  footer?: Type<unknown>;
  modalClass?: string;
}
